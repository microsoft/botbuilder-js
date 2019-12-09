const { ok: assert, strictEqual } = require('assert');
const { ActivityTypes } = require('botbuilder-core');
const { AuthenticationConfiguration, ClaimsIdentity, SimpleCredentialProvider } = require('botframework-connector');
const { ActivityHandler, BotFrameworkAdapter, SkillConversationIdFactoryBase, SkillHandler } = require('../../');

class ConvIdFactory extends SkillConversationIdFactoryBase {
    constructor() {
        super();
        this.refs = {};
        this.skillId = 'skillId';
    }
    async createSkillConversationId(convRef = { conversation: { id: undefined }}) {
        this.refs[this.skillId] = convRef;
        return this.skillId;
    }
    async getConversationReference(skillConvId) {
        return this.refs[skillConvId];
    }
    async deleteConversationReference(skillConvId) {
        this.refs[skillConvId] = undefined;
    }
}

describe('SkillHandler', function() {
    this.timeout(3000);
    it('should fail construction without required adapter', () => {
        try {
            const handler = new SkillHandler(undefined, {}, {}, {}, {});
        } catch (e) {
            strictEqual(e.message, 'missing adapter.');
        }

        try {
            const handler = new SkillHandler({}, undefined, {}, {}, {});
        } catch (e) {
            strictEqual(e.message, 'missing conversationIdFactory.');
        }
    });

    it('should fail construction without required factory', () => {
        try {
            const handler = new SkillHandler({}, undefined, {}, {}, {});
        } catch (e) {
            strictEqual(e.message, 'missing conversationIdFactory.');
        }
    });

    it('should successfully construct', () => {
        const adapter = new BotFrameworkAdapter({});
        const bot = new ActivityHandler();
        const creds = new SimpleCredentialProvider('', '');
        const authConfig = new AuthenticationConfiguration();

        const handler = new SkillHandler(adapter, bot, new ConvIdFactory(), creds, authConfig);
    });

    it('should call processActivity() from onReplyToActivity()', async () => {
        const adapter = new BotFrameworkAdapter({});
        const bot = new ActivityHandler();
        const creds = new SimpleCredentialProvider('', '');
        const authConfig = new AuthenticationConfiguration();
        const identity = new ClaimsIdentity([]);
        const convId = 'convId';
        const actualReplyToId = '1';
        const skillActivity = { type: ActivityTypes.Message };

        const handler = new SkillHandler(adapter, bot, {}, creds, authConfig);
        handler.processActivity = async function(skillIdentity, conversationId, replyToId, activity) {
            strictEqual(skillIdentity, identity);
            strictEqual(conversationId, convId);
            strictEqual(replyToId, actualReplyToId);
            strictEqual(activity, skillActivity);
            return { id: 1 };
        };

        const response = await handler.onReplyToActivity(identity, convId, actualReplyToId, skillActivity);
        strictEqual(response.id, 1);
    });

    it('should call processActivity() from onSendToConversation()', async () => {
        const adapter = new BotFrameworkAdapter({});
        const bot = new ActivityHandler();
        const creds = new SimpleCredentialProvider('', '');
        const authConfig = new AuthenticationConfiguration();
        const identity = new ClaimsIdentity([]);
        const convId = 'convId';
        const skillActivity = { type: ActivityTypes.Message };

        const handler = new SkillHandler(adapter, bot, {}, creds, authConfig);
        handler.processActivity = async function(skillIdentity, conversationId, replyToId, activity) {
            strictEqual(skillIdentity, identity);
            strictEqual(conversationId, convId);
            strictEqual(activity, skillActivity);
            strictEqual(replyToId, null);
            return { id: 1 };
        };

        const response = await handler.onSendToConversation(identity, convId, skillActivity);
        strictEqual(response.id, 1);
    });

    describe('private methods', () => {
        describe('processActivity()', () => {
            it('should fail without a conversationReference', async () => {
                const adapter = new BotFrameworkAdapter({});
                const bot = new ActivityHandler();
                const creds = new SimpleCredentialProvider('', '');
                const authConfig = new AuthenticationConfiguration();
                const handler = new SkillHandler(adapter, bot, new ConvIdFactory(), creds, authConfig);
                try {
                    await handler.processActivity({}, 'convId', 'replyId', {});
                } catch (e) {
                    strictEqual(e.message, 'conversationReference not found.');
                }
            });

            const identity = { aud: 'audience' };
            it('should cache the ClaimsIdentity on the turnState', async () => {
                const adapter = new BotFrameworkAdapter({});
                const bot = new ActivityHandler();
                const factory = new ConvIdFactory();
                const creds = new SimpleCredentialProvider('', '');
                const authConfig = new AuthenticationConfiguration();
                const handler = new SkillHandler(adapter, bot, factory, creds, authConfig);
                const serviceUrl = 'http://localhost/api/messages';
                factory.refs['convId'] = 'conversationId';
                const skillActivity = {
                    type: ActivityTypes.Event,
                    serviceUrl
                };
                bot.run = async (context) => {
                    assert(context);
                    strictEqual(context.turnState.get(context.adapter.BotIdentityKey), identity);
                };
                const resourceResponse = await handler.processActivity(identity, 'convId', 'replyId', skillActivity);
                assert(resourceResponse);
                assert(resourceResponse.id);
            });

            it('should call bot logic for Event activities from a skill and modify context.activity', async () => {
                const adapter = new BotFrameworkAdapter({});
                const bot = new ActivityHandler();
                const factory = new ConvIdFactory();
                const creds = new SimpleCredentialProvider('', '');
                const authConfig = new AuthenticationConfiguration();
                const handler = new SkillHandler(adapter, bot, factory, creds, authConfig);
                const serviceUrl = 'http://localhost/api/messages';
                const name = 'eventName';
                const relatesTo = { activityId: 'activityId' };
                const replyToId = 'replyToId';
                const entities = [1];
                const localTimestamp = '1';
                const value = '418';
                const timestamp = '1Z';
                const channelData = { channelData: 'data' };
                factory.refs['convId'] = 'conversationId';
                const skillActivity = {
                    type: ActivityTypes.Event,
                    name, relatesTo, entities,
                    localTimestamp, value,
                    timestamp, channelData,
                    serviceUrl, replyToId,
                };
                bot.run = async (context) => {
                    assert(context);
                    strictEqual(context.turnState.get(context.adapter.BotIdentityKey), identity);
                    const a = context.activity;
                    strictEqual(a.name, name);
                    strictEqual(a.relatesTo, relatesTo);
                    strictEqual(a.replyToId, replyToId);
                    strictEqual(a.entities, entities);
                    strictEqual(a.localTimestamp, localTimestamp);
                    strictEqual(a.value, value);
                    strictEqual(a.timestamp, timestamp);
                    strictEqual(a.channelData, channelData);
                    strictEqual(a.replyToId, replyToId);
                };
                await handler.processActivity(identity, 'convId', 'replyId', skillActivity);
            });

            it('should call bot logic for EndOfConversation activities from a skill and modify context.activity', async () => {
                const adapter = new BotFrameworkAdapter({});
                const bot = new ActivityHandler();
                const factory = new ConvIdFactory();
                const creds = new SimpleCredentialProvider('', '');
                const authConfig = new AuthenticationConfiguration();
                const handler = new SkillHandler(adapter, bot, factory, creds, authConfig);
                const serviceUrl = 'http://localhost/api/messages';
                const text = 'bye';
                const replyToId = 'replyToId';
                const entities = [1];
                const localTimestamp = '1';
                const code = 418;
                const timestamp = '1Z';
                const channelData = { channelData: 'data' };
                const value = { three: 3 };
                factory.refs['convId'] = 'conversationId';
                const skillActivity = {
                    type: ActivityTypes.EndOfConversation,
                    text, code, replyToId, entities,
                    localTimestamp, timestamp,
                    value, channelData, serviceUrl
                };
                bot.run = async (context) => {
                    assert(context);
                    strictEqual(context.turnState.get(context.adapter.BotIdentityKey), identity);
                    const a = context.activity;
                    strictEqual(a.type, ActivityTypes.EndOfConversation);
                    strictEqual(a.text, text);
                    strictEqual(a.code, code);
                    strictEqual(a.replyToId, replyToId);
                    strictEqual(a.entities, entities);
                    strictEqual(a.localTimestamp, localTimestamp);
                    strictEqual(a.value, value);
                    strictEqual(a.timestamp, timestamp);
                    strictEqual(a.channelData, channelData);
                    strictEqual(a.replyToId, replyToId);
                };
                await handler.processActivity(identity, 'convId', 'replyId', skillActivity);
            });

            it('should forward activity from Skill for other ActivityTypes', async () => {
                const adapter = new BotFrameworkAdapter({});
                const bot = new ActivityHandler();
                const factory = new ConvIdFactory();
                const creds = new SimpleCredentialProvider('', '');
                const authConfig = new AuthenticationConfiguration();
                const handler = new SkillHandler(adapter, bot, factory, creds, authConfig);
                const serviceUrl = 'http://localhost/api/messages';
                factory.refs['convId'] = 'conversationId';
                const text = 'Test';
                const skillActivity = {
                    type: ActivityTypes.Message,
                    serviceUrl, text
                };
                // Override sendActivities to do nothing.
                adapter.sendActivities = async (context, activities) => {
                    assert(context);
                    assert(activities);
                    strictEqual(activities.length, 1);
                    strictEqual(activities[0].type, ActivityTypes.Message);
                    strictEqual(activities[0].text, text);
                };
                await handler.processActivity(identity, 'convId', 'replyId', skillActivity);
            });
        });
    });
});
