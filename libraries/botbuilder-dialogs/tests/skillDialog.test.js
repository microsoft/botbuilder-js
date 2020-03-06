const { equal, ok: assert, strictEqual } = require('assert');
const { ActivityTypes, TestAdapter, SkillConversationIdFactoryBase, TurnContext } = require('botbuilder-core');
const { Dialog, DialogContext, SkillDialog } = require('../');

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
    assert(e instanceof TypeError);
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
        assert(sendToSkillCalled, 'sendToSkill not called');
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
        assert(repromptDialogCalled, 'sendToSkill not called');
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
            
            dialog.sendToSkill(context, {}).then((a) => assert(typeof a === 'undefined'), (e) => done(e));
        });
    });
});

/**
 * @param {string} fromBotOAuthScope 
 * @param {string} fromBotId 
 * @param {object} activity 
 * @param {object} botFrameworkSkill { id, appId, skillEndpoint }
 */
function createFactoryOptions(fromBotOAuthScope, fromBotId, activity, botFrameworkSkill) {
    return { fromBotOAuthScope, fromBotId, activity, botFrameworkSkill };
}

class SkillConversationIdFactory extends SkillConversationIdFactoryBase {
    constructor(config = { disableCreateWithOpts: false, disableGetSkillRef: false }) {
        super();
        this.disableCreateWithOpts = config.disableCreateWithOpts;
        this.disableGetSkillRef = config.disableGetSkillRef;
    }

    async createSkillConversationIdWithOptions(opts) {
        if (this.disableCreateWithOpts) {
            return super.createSkillConversationIdWithOptions();
        }
    }

    async createSkillConversationId() {

    }

    async getConversationReference() {

    }

    async getSkillConversationReference() {
        if (this.disableGetSkillRef) {
            return super.getSkillConversationReference();
        }
    }

    deleteConversationReference() {

    }

}
