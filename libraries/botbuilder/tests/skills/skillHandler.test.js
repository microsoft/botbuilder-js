const assert = require('assert');
const sinon = require('sinon');
const { BotFrameworkAdapter, SkillHandler } = require('../../');
const { ConversationIdFactory } = require('./conversationIdFactory');

const {
    ActivityHandler,
    ActivityTypes,
    CallerIdConstants,
    SkillConversationReferenceKey,
    TurnContext,
} = require('botbuilder-core');

const {
    AppCredentials,
    AuthenticationConfiguration,
    AuthenticationConstants,
    ClaimsIdentity,
    SimpleCredentialProvider,
} = require('botframework-connector');

describe('SkillHandler', function () {
    const adapter = new BotFrameworkAdapter({});
    const bot = new ActivityHandler();
    const factory = new ConversationIdFactory();
    const creds = new SimpleCredentialProvider('', '');
    const authConfig = new AuthenticationConfiguration();
    const handler = new SkillHandler(adapter, bot, factory, creds, authConfig);

    let sandbox;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => {
        sandbox.restore();
    });

    // Supports mocking the turn context and registering expectations on it
    const expectsContext = (callback) => {
        sandbox.replace(adapter, 'createContext', (activity) => {
            const context = new TurnContext(adapter, activity);
            callback(sandbox.mock(context));
            return context;
        });
    };

    // Registers expectations that verify a particular skill conversation is returned from the factory
    const expectsFactoryGetSkillConversationReference = (ref) =>
        sandbox
            .mock(factory)
            .expects('getSkillConversationReference')
            .withArgs('convId')
            .once()
            .returns(Promise.resolve(ref));

    // Mocks the handler get skill conversation reference method to return a particular conversation reference
    const expectsGetSkillConversationReference = (conversationId, serviceUrl = 'http://localhost/api/messages') =>
        sandbox
            .mock(handler)
            .expects('getSkillConversationReference')
            .withArgs(conversationId)
            .returns(
                Promise.resolve({
                    conversationReference: { serviceUrl },
                    oAuthScope: 'oAuthScope',
                })
            );

    // Registers expectation that handler.processActivity is invoked with a particular set of arguments
    const expectsProcessActivity = (...args) =>
        sandbox
            .mock(handler)
            .expects('processActivity')
            .withArgs(...args)
            .once();

    // Registers expectation that bot.run is invoked with a particular set of arguments
    const expectsBotRun = (activity, identity) =>
        sandbox
            .mock(bot)
            .expects('run')
            .withArgs(
                sinon
                    .match((context) => {
                        assert.deepStrictEqual(context.turnState.get(adapter.BotIdentityKey), identity);
                        return true;
                    })
                    .and(sinon.match({ activity }))
            )
            .once();

    describe('constructor()', () => {
        const testCases = [
            { label: 'adapter', args: [undefined, bot, factory, {}, {}, {}] },
            { label: 'bot', args: [adapter, undefined, factory, {}, {}, {}] },
            { label: 'conversationIdFactory', args: [adapter, bot, undefined, {}, {}, {}] },
        ];

        testCases.forEach((testCase) => {
            it(`should fail without required ${testCase.label}`, () => {
                try {
                    new SkillHandler(...testCase.args);
                    assert.fail('should have thrown');
                } catch (err) {
                    assert.strictEqual(err.message, `missing ${testCase.label}.`);
                }
            });
        });

        it('should succeed', () => {
            new SkillHandler(adapter, bot, factory, creds, authConfig);
        });
    });

    describe('onReplyToActivity()', () => {
        it('should call processActivity()', async () => {
            const identity = new ClaimsIdentity([]);
            const convId = 'convId';
            const activityId = 'activityId';
            const skillActivity = { type: ActivityTypes.Message };

            expectsProcessActivity(identity, convId, activityId, skillActivity);
            await handler.onReplyToActivity(identity, convId, activityId, skillActivity);
            sandbox.verify();
        });
    });

    describe('onSendToConversation()', () => {
        it('should call processActivity()', async () => {
            const identity = new ClaimsIdentity([]);
            const convId = 'convId';
            const skillActivity = { type: ActivityTypes.Message };

            expectsProcessActivity(identity, convId, null, skillActivity);
            await handler.onSendToConversation(identity, convId, skillActivity);
            sandbox.verify();
        });
    });

    describe('updateActivity()', () => {
        it('should call updateActivity on context', async () => {
            const convId = 'convId';
            const activityId = 'activityId';
            const updatedActivity = {
                type: ActivityTypes.Event,
                name: 'eventName',
                serviceUrl: 'http://localhost/api/messages',
            };

            expectsGetSkillConversationReference(convId, updatedActivity.serviceUrl);

            expectsContext((context) =>
                context.expects('updateActivity').withArgs(sinon.match(updatedActivity)).once().resolves()
            );

            await handler.onUpdateActivity(new ClaimsIdentity([]), convId, activityId, updatedActivity);
            sandbox.verify();
        });
    });

    describe('deleteActivity()', () => {
        it('should call deleteActivity on context', async () => {
            const convId = 'convId';
            const activityId = 'activityId';

            expectsGetSkillConversationReference(convId);
            expectsContext((context) => context.expects('deleteActivity').withArgs(activityId).once().resolves());

            await handler.onDeleteActivity(new ClaimsIdentity([]), convId, activityId);
            sandbox.verify();
        });
    });

    describe('private methods', () => {
        describe('continueConversation()', () => {
            const identity = new ClaimsIdentity([{ type: 'aud', value: 'audience' }]);
            const conversationId = 'conversationId';

            it('should cache the ClaimsIdentity, ConnectorClient and SkillConversationReference on the turnState', async function () {
                expectsGetSkillConversationReference(conversationId);

                await handler.continueConversation(identity, conversationId, async (adapter, ref, context) => {
                    assert.deepStrictEqual(
                        context.turnState.get(adapter.BotIdentityKey),
                        identity,
                        'cached identity exists'
                    );

                    assert.deepStrictEqual(
                        context.turnState.get(handler.SkillConversationReferenceKey),
                        ref,
                        'cached conversation ref exists'
                    );

                    sandbox.verify();
                });
            });
        });

        describe('processActivity()', () => {
            it('should fail without a skillConversationReference', async () => {
                expectsFactoryGetSkillConversationReference(null);

                try {
                    await handler.processActivity({}, 'convId', 'replyId', {});
                    assert.fail('should have thrown');
                } catch (e) {
                    assert.strictEqual(e.message, 'skillConversationReference not found');
                }

                sandbox.verify();
            });

            it('should fail without a conversationReference', async () => {
                expectsFactoryGetSkillConversationReference({});

                try {
                    await handler.processActivity({}, 'convId', 'replyId', {});
                    assert.fail('should have thrown');
                } catch (e) {
                    assert.strictEqual(e.message, 'conversationReference not found.');
                }

                sandbox.verify();
            });

            it('should call bot logic for Event activities from a skill and modify context.activity', async () => {
                const identity = new ClaimsIdentity([{ type: 'aud', value: 'audience' }]);

                const skillActivity = {
                    type: ActivityTypes.Event,
                    name: 'eventName',
                    relatesTo: { activityId: 'activityId' },
                    entities: [1],
                    localTimestamp: '1',
                    value: '418',
                    timestamp: '1Z',
                    channelData: { channelData: 'data' },
                    serviceUrl: 'http://localhost/api/messages',
                    replyToId: 'replyToId',
                };

                expectsGetSkillConversationReference('convId', skillActivity.serviceUrl);
                expectsBotRun(skillActivity, identity);

                await handler.processActivity(identity, 'convId', 'replyId', skillActivity);
                sandbox.verify();
            });

            it('should call bot logic for EndOfConversation activities from a skill and modify context.activity', async () => {
                const identity = new ClaimsIdentity(
                    [
                        { type: AuthenticationConstants.AudienceClaim, value: '00000000-0000-0000-0000-000000000001' },
                        { type: AuthenticationConstants.AppIdClaim, value: '00000000-0000-0000-0000-000000000000' },
                        { type: AuthenticationConstants.VersionClaim, value: '1.0' },
                    ],
                    true
                );

                const skillActivity = {
                    type: ActivityTypes.EndOfConversation,
                    text: 'bye',
                    code: 418,
                    replyToId: 'replyToId',
                    entities: [1],
                    localTimestamp: '1',
                    timestamp: '1Z',
                    value: { three: 3 },
                    channelData: { channelData: 'data' },
                    serviceUrl: 'http://localhost/api/messages',
                };

                expectsGetSkillConversationReference('convId', skillActivity.serviceUrl);
                expectsBotRun(skillActivity, identity);

                await handler.processActivity(identity, 'convId', 'replyId', skillActivity);
                sandbox.verify();
            });

            it('should forward activity from Skill for other ActivityTypes', async () => {
                const identity = new ClaimsIdentity([{ type: 'aud', value: 'audience' }]);

                const skillActivity = {
                    type: ActivityTypes.Message,
                    serviceUrl: 'http://localhost/api/messages',
                    text: 'Test',
                };

                expectsGetSkillConversationReference('convId', skillActivity.serviceUrl);

                sandbox
                    .mock(adapter)
                    .expects('sendActivities')
                    .withArgs(sinon.match.instanceOf(TurnContext), sinon.match.some(sinon.match(skillActivity)))
                    .once()
                    .returns(Promise.resolve([{ id: 'responseId' }]));

                const response = await handler.processActivity(identity, 'convId', 'replyId', skillActivity);
                assert.strictEqual(response.id, 'responseId');
                sandbox.verify();
            });

            it(`should use the skill's appId to set the callback's activity.callerId`, async () => {
                const skillAppId = '00000000-0000-0000-0000-000000000000';
                const skillConsumerAppId = '00000000-0000-0000-0000-000000000001';

                const identity = new ClaimsIdentity(
                    [
                        { type: AuthenticationConstants.AudienceClaim, value: skillConsumerAppId },
                        { type: AuthenticationConstants.AppIdClaim, value: skillAppId },
                        { type: AuthenticationConstants.VersionClaim, value: '1.0' },
                    ],
                    true
                );

                const skillActivity = {
                    type: ActivityTypes.Event,
                    serviceUrl: 'http://localhost/api/messages',
                };

                expectsGetSkillConversationReference('convId', skillActivity.serviceUrl);

                sandbox
                    .mock(bot)
                    .expects('run')
                    .withArgs(
                        sinon.match((context) => {
                            const fromKey = context.turnState.get(SkillConversationReferenceKey);
                            assert(fromKey, 'skillConversationReference was not cached in TurnState');

                            const fromHandlerKey = context.turnState.get(handler.SkillConversationReferenceKey);
                            assert(fromHandlerKey, 'the key on the SkillHandler did not return TurnState cached value');

                            assert.strictEqual(
                                fromKey,
                                fromHandlerKey,
                                'the keys should return the same cached values'
                            );

                            assert.strictEqual(
                                context.activity.callerId,
                                `${CallerIdConstants.BotToBotPrefix}${skillAppId}`
                            );

                            return true;
                        })
                    )
                    .once();

                await handler.processActivity(identity, 'convId', 'replyId', skillActivity);
                sandbox.verify();
            });
        });
    });
});
