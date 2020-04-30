const { ok, strictEqual } = require('assert');
const { createHash } = require('crypto');
const {
    ActivityTypes,
    CardFactory,
    Channels,
    ConversationState,
    DeliveryModes,
    MemoryStorage,
    MessageFactory,
    TestAdapter,
    SkillConversationIdFactoryBase,
    TurnContext,
    AutoSaveStateMiddleware,
} = require('botbuilder-core');
const { spy, stub } = require('sinon');
const { Dialog, SkillDialog } = require('../');

const DEFAULT_OAUTHSCOPE = 'https://api.botframework.com';
const DEFAULT_GOV_OAUTHSCOPE = 'https://api.botframework.us';

const defaultSkillDialogOptions = {
    botId: 'botId',
    conversationIdFactory: {},
    conversationState: {},
    skill: {},
    skillHostEndpoint: {}
};

function typeErrorValidator(e, expectedMessage) {
    ok(e instanceof TypeError);
    strictEqual(e.message, expectedMessage);
}

describe('SkillDialog', function() {
    this.timeout(3000);

    it('repromptDialog() should call sendToSkill()', async () => {
        const adapter = new TestAdapter(/* logic param not required */);
        const context = new TurnContext(adapter, { type: ActivityTypes.Message, id: 'activity-id' });
        context.turnState.set(adapter.OAuthScopeKey, DEFAULT_OAUTHSCOPE);
        const dialog = new SkillDialog({} , 'SkillDialog');
        
        let sendToSkillCalled = false;
        dialog.sendToSkill = () => {
            sendToSkillCalled = true;
        };
        
        await dialog.repromptDialog(context, {});
        ok(sendToSkillCalled, 'sendToSkill not called');
    });

    it('resumeDialog() should call repromptDialog()', async () => {
        const adapter = new TestAdapter(/* logic param not required */);
        const context = new TurnContext(adapter, { type: ActivityTypes.Message, id: 'activity-id' });
        context.turnState.set(adapter.OAuthScopeKey, DEFAULT_OAUTHSCOPE);
        const dialog = new SkillDialog({} , 'SkillDialog');
        
        let repromptDialogCalled = false;
        dialog.repromptDialog = () => {
            repromptDialogCalled = true;
        };
        
        const result = await dialog.resumeDialog(context, {});
        ok(repromptDialogCalled, 'sendToSkill not called');
        strictEqual(result, Dialog.EndOfTurn);
    });

    describe('(private) validateBeginDialogArgs()', () => {
        it('should fail if options is falsy', () => {
            const activity = {
                type: ActivityTypes.Message,
                text: 'Hello SkillDialog!'
            };
            const validatedArgs = SkillDialog.validateBeginDialogArgs({ activity });
            const validatedActivity = validatedArgs.activity;
            strictEqual(validatedActivity.type, ActivityTypes.Message);
            strictEqual(validatedActivity.text, 'Hello SkillDialog!');
        });

        it('should fail if options is falsy', () => {
            try {
                SkillDialog.validateBeginDialogArgs();
            } catch (e) {
                typeErrorValidator(e, 'Missing options parameter');
            }
        });

        it('should fail if dialogArgs.activity is falsy', () => {
            try {
                SkillDialog.validateBeginDialogArgs({});
            } catch (e) {
                typeErrorValidator(e, '"activity" is undefined or null in options.');
            }
        });

        it('should fail if dialogArgs.activity.type is not "message" or "event"', () => {
            const type = ActivityTypes.EndOfConversation;
            try {
                SkillDialog.validateBeginDialogArgs({ activity: { type } });
            } catch (e) {
                typeErrorValidator(e, `Only "${ ActivityTypes.Message }" and "${ ActivityTypes.Event }" activities are supported. Received activity of type "${ type }" in options.`);
            }
        });
    });

    describe('(private) sendToSkill()', () => {
        it(`should rethrow the error if its message is not "Not Implemented" error`, async () => {
            const adapter = new TestAdapter(/* logic param not required */);
            const context = new TurnContext(adapter, { type: ActivityTypes.Message });
            context.turnState.set(adapter.OAuthScopeKey, DEFAULT_OAUTHSCOPE);
            const dialog = new SkillDialog({
                botId: 'botId',
                conversationIdFactory: { createSkillConversationIdWithOptions: async () => { throw new Error('Whoops'); }
                },
                conversationState: {},
                skill: {},
                skillHostEndpoint: 'http://localhost:3980/api/messages'
            } , 'SkillDialog');
            
            try {
                await dialog.sendToSkill(context, {});
            } catch (e) {
                strictEqual(e.message, 'Whoops');
            }
        });

        it('should not rethrow if Error.message is "Not Implemented"', (done) => {
            const adapter = new TestAdapter(/* logic param not required */);
            const context = new TurnContext(adapter, { activity: {} });
            context.turnState.set(adapter.OAuthScopeKey, DEFAULT_OAUTHSCOPE);
            const dialog = new SkillDialog({
                botId: 'botId',
                conversationIdFactory: { 
                    createSkillConversationIdWithOptions: async () => { throw new Error('Not Implemented'); },
                    createSkillConversationId: async () => done()
                },
                conversationState: {
                    saveChanges: () => null
                },
                skill: {},
                skillHostEndpoint: 'http://localhost:3980/api/messages',
                skillClient: {
                    postActivity: async () => { return { status: 200 }; }
                }
            } , 'SkillDialog');
            
            dialog.sendToSkill(context, {}).then((a) => ok(typeof a === 'undefined'), (e) => done(e));
        });
    });

    describe('intercepting OAuthCards', () => {
        let BOTBUILDER = null;
        let BOTBUILDER_TESTING = null;
        // Use botbuilder for tests
        try {
            BOTBUILDER = require('../../botbuilder');
            BOTBUILDER_TESTING = require('../../botbuilder-testing');
        } catch (err) {
            console.warn('=====\nUnable to load botbuilder module. "intercepting OAuthCards" tests will not be run.\n')
        }

        if (BOTBUILDER !== null && BOTBUILDER_TESTING !== null) {
            const { BotFrameworkHttpClient } = BOTBUILDER;
            const { DialogTestClient } = BOTBUILDER_TESTING;

            it('should intercept OAuthCards for SSO', async () => {
                const connectionName = 'connectionName';
                const firstResponse = { activities: [ createOAuthCardAttachmentActivity('https://test')] };
                const skillClient = new BotFrameworkHttpClient({});
                const postActivityStub = stub(skillClient, 'postActivity');
                postActivityStub.onFirstCall().returns({ status: 200, body: firstResponse });
                postActivityStub.onSecondCall().returns({ status: 200 });

                const conversationState = new ConversationState(new MemoryStorage());
                const dialogOptions = createSkillDialogOptions(conversationState, skillClient);

                const dialogUnderTest = new SkillDialog(dialogOptions, 'skillDialog');
                const sendTokenExchangeSpy = spy(dialogUnderTest, 'sendTokenExchangeInvokeToSkill');
                const activityToSend = createSendActivity();
                const beginSkillDialogOptions = { activity: activityToSend, connectionName };

                const client = new DialogTestClient(Channels.Test, dialogUnderTest, beginSkillDialogOptions, [new AutoSaveStateMiddleware(conversationState)], conversationState);
                client._testAdapter.addExchangeableToken(connectionName, Channels.Test, 'user1', 'https://test', 'https://test1');

                const finalActivity = await client.sendActivity('irrelevant');
                ok(sendTokenExchangeSpy.called);
                strictEqual(finalActivity, undefined);
            });

            it('should not intercept OAuthCards for empty ConnectionName', async () => {
                const connectionName = 'connectionName';
                const firstResponse = { activities: [ createOAuthCardAttachmentActivity('https://test')] };
                const skillClient = new BotFrameworkHttpClient({});
                const postActivityStub = stub(skillClient, 'postActivity');
                postActivityStub.onFirstCall().returns({ status: 200, body: firstResponse });

                const conversationState = new ConversationState(new MemoryStorage());
                const dialogOptions = createSkillDialogOptions(conversationState, skillClient);

                const dialogUnderTest = new SkillDialog(dialogOptions, 'skillDialog');
                const sendTokenExchangeSpy = spy(dialogUnderTest, 'sendTokenExchangeInvokeToSkill');
                const activityToSend = createSendActivity();
                const beginSkillDialogOptions = { activity: activityToSend };

                const client = new DialogTestClient(Channels.Test, dialogUnderTest, beginSkillDialogOptions, [new AutoSaveStateMiddleware(conversationState)], conversationState);
                client._testAdapter.addExchangeableToken(connectionName, Channels.Test, 'user1', 'https://test', 'https://test1');

                const finalActivity = await client.sendActivity('irrelevant');
                ok(sendTokenExchangeSpy.notCalled);
                ok(finalActivity !== undefined);
                strictEqual(finalActivity.attachments.length, 1);
            });

           it('should not intercept OAuthCards for EmptyToken', async () => {
                const firstResponse = { activities: [ createOAuthCardAttachmentActivity('https://test')] };
                const skillClient = new BotFrameworkHttpClient({});
                const postActivityStub = stub(skillClient, 'postActivity');
                postActivityStub.onFirstCall().returns({ status: 200, body: firstResponse });

                const conversationState = new ConversationState(new MemoryStorage());
                const dialogOptions = createSkillDialogOptions(conversationState, skillClient);

                const dialogUnderTest = new SkillDialog(dialogOptions, 'skillDialog');
                const sendTokenExchangeSpy = spy(dialogUnderTest, 'sendTokenExchangeInvokeToSkill');
                const activityToSend = createSendActivity();
                const beginSkillDialogOptions = { activity: activityToSend };
    
    
                const client = new DialogTestClient(Channels.Test, dialogUnderTest, beginSkillDialogOptions, [new AutoSaveStateMiddleware(conversationState)], conversationState);
                // dont add exchangeable token to test adapter
                const finalActivity = await client.sendActivity('irrelevant');

                ok(sendTokenExchangeSpy.notCalled);
                ok(finalActivity !== undefined);
                strictEqual(finalActivity.attachments.length, 1);
            });

            it('should not intercept OAuthCards for TokenException', async () => {
                const connectionName = 'connectionName';
                const firstResponse = { activities: [ createOAuthCardAttachmentActivity('https://test')] };
                const skillClient = new BotFrameworkHttpClient({});
                const postActivityStub = stub(skillClient, 'postActivity');
                postActivityStub.onFirstCall().returns({ status: 200, body: firstResponse });

                const conversationState = new ConversationState(new MemoryStorage());
                const dialogOptions = createSkillDialogOptions(conversationState, skillClient);

                const dialogUnderTest = new SkillDialog(dialogOptions, 'skillDialog');
                const sendTokenExchangeSpy = spy(dialogUnderTest, 'sendTokenExchangeInvokeToSkill');
                const activityToSend = createSendActivity();
                const beginSkillDialogOptions = { activity: activityToSend, connectionName };

                const client = new DialogTestClient(Channels.Test, dialogUnderTest, beginSkillDialogOptions, [new AutoSaveStateMiddleware(conversationState)], conversationState);
                client._testAdapter.addExchangeableToken(connectionName, Channels.Test, 'user1', 'https://test');

                const finalActivity = await client.sendActivity('irrelevant');
                ok(sendTokenExchangeSpy.notCalled);
                ok(finalActivity !== undefined);
                strictEqual(finalActivity.attachments.length, 1);
            });

            it('should not intercept OAuthCards for BadRequest', async () => {
                const connectionName = 'connectionName';
                const firstResponse = { activities: [ createOAuthCardAttachmentActivity('https://test')] };
                const skillClient = new BotFrameworkHttpClient({});
                const postActivityStub = stub(skillClient, 'postActivity');
                postActivityStub.onFirstCall().returns({ status: 200, body: firstResponse });
                // Return a 4xx status code so the OAuthCard is not intercepted.
                postActivityStub.onSecondCall().returns({ status: 409 });

                const conversationState = new ConversationState(new MemoryStorage());
                const dialogOptions = createSkillDialogOptions(conversationState, skillClient);

                const dialogUnderTest = new SkillDialog(dialogOptions, 'skillDialog');
                const sendTokenExchangeSpy = spy(dialogUnderTest, 'sendTokenExchangeInvokeToSkill');
                const activityToSend = createSendActivity();
                const beginSkillDialogOptions = { activity: activityToSend, connectionName };

                const client = new DialogTestClient(Channels.Test, dialogUnderTest, beginSkillDialogOptions, [new AutoSaveStateMiddleware(conversationState)], conversationState);
                client._testAdapter.addExchangeableToken(connectionName, Channels.Test, 'user1', 'https://test', 'https://test1');

                const finalActivity = await client.sendActivity('irrelevant');
                ok(sendTokenExchangeSpy.called);
                ok(finalActivity !== undefined);
                strictEqual(finalActivity.attachments.length, 1);
            });
        }
    });
});

/**
 * 
 * @param {string} uri 
 */
function createOAuthCardAttachmentActivity(uri) {
    const oauthCard = {
        tokenExchangeResource: { uri }
    };

    const attachment = {
        contentType: CardFactory.contentTypes.oauthCard,
        content: oauthCard
    };

    const attachmentActivity = MessageFactory.attachment(attachment);
    attachmentActivity.conversation = { id: uuid() };
    attachmentActivity.from = { id: 'blah', name: 'name' };

    return attachmentActivity;
}

/**
 * @param {*} conversationState 
 * @param {*} mockSkillClient
 * @returns A Skill Dialog Options object.
 */
function createSkillDialogOptions(conversationState, mockSkillClient) {
    const dialogOptions = {
        botId: uuid(),
        skillHostEndpoint: 'http://test.contoso.com/skill/messages',
        conversationIdFactory: new SimpleConversationIdFactory(),
        conversationState: conversationState,
        skillClient: mockSkillClient,
        skill: {
            appId: uuid(),
            skillEndpoint: 'http://testskill.contoso.com/api/messages'
        }
    };

    return dialogOptions;
}

function createSendActivity() {
    const activityToSend = {
        type: ActivityTypes.Message,
        attachments: [],
        entities: []
    };
    activityToSend.deliveryMode = DeliveryModes.ExpectReplies;
    activityToSend.text = uuid();
    return activityToSend;
}

class SimpleConversationIdFactory extends SkillConversationIdFactoryBase {
    constructor(config = { disableCreateWithOpts: false, disableGetSkillRef: false }) {
        super();
        this._conversationRefs = new Map();
        this.disableCreateWithOpts = config.disableCreateWithOpts;
        this.disableGetSkillRef = config.disableGetSkillRef;
    }

    async createSkillConversationIdWithOptions(opts) {
        if (this.disableCreateWithOpts) {
            return super.createSkillConversationIdWithOptions();
        }
    }

    async createSkillConversationId(options) {
        const key = createHash('md5').update(options.activity.conversation.id + options.activity.serviceUrl).digest('hex');

        const ref = this._conversationRefs.has(key);
        if (!ref) {
            this._conversationRefs.set(key, {
                conversationReference: TurnContext.getConversationReference(options.activity),
                oAuthScope: options.fromBotOAuthScope
            });
        }
        return key;
    }

    async getConversationReference() {

    }

    async getSkillConversationReference(skillConversationId) {
        return this._conversationRefs.get(skillConversationId);
    }

    deleteConversationReference() {

    }

}

function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}