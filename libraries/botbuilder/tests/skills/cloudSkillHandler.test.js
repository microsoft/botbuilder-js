const assert = require('assert');
const sinon = require('sinon');
const { CloudAdapter, CloudSkillHandler } = require('../../');
const { ConversationIdFactory } = require('./conversationIdFactory');
const { ActivityHandler } = require('botbuilder-core');
const { ClaimsIdentity, BotFrameworkAuthenticationFactory } = require('botframework-connector');

describe('CloudSkillHandler', function () {
    const authConfig = BotFrameworkAuthenticationFactory.create();
    const adapter = new CloudAdapter();
    const bot = new ActivityHandler();
    const factory = new ConversationIdFactory();
    const handler = new CloudSkillHandler(adapter, bot, factory, authConfig);

    let sandbox;
    beforeEach(function () {
        sandbox = sinon.createSandbox();
    });
    afterEach(function () {
        sandbox.restore();
    });

    // Registers expectation that handler.onGetMember is invoked with a particular set of arguments
    const expectsGetConversationMember = (...args) =>
        sandbox
            .mock(handler.inner)
            .expects('onGetMember')
            .withArgs(...args)
            .once()
            .resolves({ id: 'memberId', name: 'memberName' });

    describe('constructor()', function () {
        const testCases = [
            { label: 'adapter', args: [undefined, bot, factory, authConfig] },
            { label: 'logic', args: [adapter, undefined, factory, authConfig] },
            { label: 'conversationIdFactory', args: [adapter, bot, undefined, authConfig] },
        ];

        testCases.forEach((testCase) => {
            it(`should fail without required ${testCase.label}`, function () {
                assert.throws(() => new CloudSkillHandler(...testCase.args), Error(`missing ${testCase.label}.`));
            });
        });

        it('should succeed', function () {
            new CloudSkillHandler(adapter, bot, factory, authConfig);
        });
    });

    describe('onGetConversationMember()', function () {
        it('should call onGetMember()', async function () {
            const identity = new ClaimsIdentity([]);
            const userId = 'memberId';
            const convId = 'convId';

            expectsGetConversationMember(identity, userId, convId);

            const member = await handler.onGetConversationMember(identity, userId, convId);

            assert.strictEqual(member.id, 'memberId');
            assert.strictEqual(member.name, 'memberName');
            sandbox.verify();
        });
    });
});
