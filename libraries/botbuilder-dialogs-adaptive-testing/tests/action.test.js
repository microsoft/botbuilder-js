const assert = require('assert');
const nock = require('nock');
const {
    ActivityTypes,
    MessageFactory,
    SkillConversationIdFactoryBase,
    TurnContext,
    TestAdapter,
    MemoryStorage,
    ConversationState,
    UserState,
    useBotState,
} = require('botbuilder-core');
const { TestUtils } = require('..');
const { createHash } = require('crypto');
const { makeResourceExplorer } = require('./utils');

const {
    LanguageGenerationBotComponent,
    skillConversationIdFactoryKey,
    skillClientKey,
    AdaptiveDialog,
    OnBeginDialog,
    BeginSkill,
} = require('botbuilder-dialogs-adaptive');
const { DialogManager } = require('botbuilder-dialogs');

class MockSkillConversationIdFactory extends SkillConversationIdFactoryBase {
    constructor(opts = { useCreateSkillConversationId: false }) {
        super();
        this._conversationRefs = new Map();
        this.useCreateSkillConversationId = opts.useCreateSkillConversationId;
    }

    async createSkillConversationIdWithOptions(opts) {
        if (this.useCreateSkillConversationId) {
            return super.createSkillConversationIdWithOptions();
        }
        const key = createHash('sha512')
            .update(opts.activity.conversation.id + opts.activity.serviceUrl)
            .digest('hex');

        const ref = this._conversationRefs.has(key);
        if (!ref) {
            this._conversationRefs.set(key, {
                conversationReference: TurnContext.getConversationReference(opts.activity),
                oAuthScope: opts.fromBotOAuthScope,
            });
        }
        return key;
    }

    async createSkillConversationId(convRef) {
        const key = createHash('sha512')
            .update(convRef.conversation.id + convRef.serviceUrl)
            .digest('hex');

        const ref = this._conversationRefs.has(key);
        if (!ref) {
            this._conversationRefs.set(key, {
                conversationReference: convRef,
            });
        }
        return key;
    }

    async getConversationReference(skillConversationId) {
        return this._conversationRefs.get(skillConversationId);
    }

    async getSkillConversationReference(skillConversationId) {
        return this.getConversationReference(skillConversationId);
    }

    async deleteConversationReference() {
        /* not used in BeginSkill */
    }
}

class MockSkillBotFrameworkClient {
    async postActivity(fromBotId, toBotId, toUrl, serviceUrl, conversationId, activity) {
        let responseActivity = activity;

        if (activity.text.indexOf('skill') >= 0) {
            responseActivity = {
                type: 'message',
                text: 'This is the skill talking: hello',
            };
        }

        if (activity.text.indexOf('end') >= 0) {
            responseActivity = {
                type: ActivityTypes.EndOfConversation,
            };
        }

        return {
            status: 200,
            body: {
                activities: [responseActivity],
            },
        };
    }
}

class SetSkillConversationIdFactoryBaseMiddleware {
    async onTurn(context, next) {
        if (context.activity.type === ActivityTypes.Message) {
            context.turnState.set(skillConversationIdFactoryKey, new MockSkillConversationIdFactory());
            await next();
        }
    }
}

class SetSkillBotFrameworkClientMiddleware {
    async onTurn(context, next) {
        if (context.activity.type === ActivityTypes.Message) {
            context.turnState.set(skillClientKey, new MockSkillBotFrameworkClient());
            await next();
        }
    }
}

describe('ActionTests', function () {
    let resourceExplorer;

    before(function () {
        resourceExplorer = makeResourceExplorer('ActionTests', LanguageGenerationBotComponent);
    });

    it('AttachmentInput', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_AttachmentInput');
    });

    it('BeginDialog', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_BeginDialog');
    });

    it('BeginDialogWithExpr', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_BeginDialogWithExpr');
    });

    it('BeginDialogWithExpr2', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_BeginDialogWithExpr2');
    });

    it('BeginDialogWithExpr3', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_BeginDialogWithExpr3');
    });

    it('BeginDialogWithActivity', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_BeginDialogWithActivity');
    });

    it('BeginSkill', async function () {
        await TestUtils.runTestScript(
            resourceExplorer,
            'Action_BeginSkill',
            undefined,
            undefined,
            new SetSkillConversationIdFactoryBaseMiddleware(),
            new SetSkillBotFrameworkClientMiddleware(),
        );
    });

    it('BeginSkill_SkipPropertiesFromBotState', async function () {
        const beginSkillDialog = new BeginSkill({
            botId: 'test-bot-id',
            skill: {
                appId: 'test-app-id',
                skillEndpoint: 'http://localhost:39782/api/messages',
            },
            skillHostEndpoint: 'http://localhost:39782/api/messages',
        });

        const root = new AdaptiveDialog('root').configure({
            autoEndDialog: false,
            triggers: [new OnBeginDialog([beginSkillDialog])],
        });

        const dm = new DialogManager(root);

        const adapter = new TestAdapter((context) => {
            context.turnState.set(skillConversationIdFactoryKey, new MockSkillConversationIdFactory());
            context.turnState.set(skillClientKey, new MockSkillBotFrameworkClient());
            return dm.onTurn(context);
        });
        const storage = new MemoryStorage();
        const convoState = new ConversationState(storage);
        const userState = new UserState(storage);
        useBotState(adapter, convoState, userState);

        await adapter.send('skill').send('end').startTest();

        const storageKey = 'test/conversations/Convo1/';
        const {
            [storageKey]: { DialogState },
        } = await storage.read([storageKey]);

        const [{ state }] = DialogState.dialogStack;
        const [actionScope] = state._adaptive.actions;
        const [, { state: beginSkillState }] = actionScope.dialogStack;
        const options = beginSkillState['BeginSkill.dialogOptionsData'];

        assert.notEqual(options.conversationIdFactory, null);
        assert.notEqual(options.conversationState, null);
        assert.notEqual(beginSkillDialog.dialogOptions.conversationIdFactory, null);
        assert.notEqual(beginSkillDialog.dialogOptions.conversationState, null);
    });

    it('BeginSkillEndDialog', async function () {
        await TestUtils.runTestScript(
            resourceExplorer,
            'Action_BeginSkillEndDialog',
            undefined,
            undefined,
            new SetSkillConversationIdFactoryBaseMiddleware(),
            new SetSkillBotFrameworkClientMiddleware(),
        );
    });

    it('CancelAllDialogs', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_CancelAllDialogs');
    });

    it('CancelAllDialogs_DoubleCancel', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_CancelAllDialogs_DoubleCancel');
    });

    it('CancelDialog', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_CancelDialog');
    });

    it('CancelDialogs_Processed', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_CancelDialog_Processed');
    });

    it('ChoiceInput', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_ChoiceInput');
    });

    it('ChoiceInputWithLocale', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_ChoiceInput_WithLocale');
    });

    it('ChoicesInMemory', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_ChoicesInMemory');
    });

    it('ChoiceInputSimpleTemplate_en', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_ChoiceInput_SimpleTemplate_en');
    });

    it('ChoiceInputSimpleTemplate_es', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_ChoiceInput_SimpleTemplate_es');
    });

    it('ChoiceInputComplexTemplate_en', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_ChoiceInput_ComplexTemplate_en');
    });

    it('ChoiceInputComplexTemplate_es', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_ChoiceInput_ComplexTemplate_es');
    });

    it('ChoiceStringInMemory', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_ChoiceStringInMemory');
    });

    it('ChoicesWithChoiceOptions', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_ChoicesWithChoiceOptions');
    });

    it('ChoicesWithChoiceOptionsTemplate', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_ChoicesWithChoiceOptionsTemplate');
    });

    it('ConfirmInput', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_ConfirmInput');
    });

    it('DeleteActivity', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_DeleteActivity');
    });

    it('DatetimeInput', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_DatetimeInput');
    });

    it('ConfirmInputSimpleTemplate_en', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_ConfirmInput_SimpleTemplate_en');
    });

    it('ConfirmInputComplexTemplate_en', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_ConfirmInput_ComplexTemplate_en');
    });

    it('ConfirmInputSimpleTemplate_es', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_ConfirmInput_SimpleTemplate_es');
    });

    it('ConfirmInputComplexTemplate_es', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_ConfirmInput_ComplexTemplate_es');
    });

    it('ConfirmInputWithChoiceOptions', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_ConfirmInputWithChoiceOptions');
    });

    it('ConfirmInputWithChoiceOptionsTemplate', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_ConfirmInputWithChoiceOptionsTemplate');
    });

    it('DeleteProperties', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_DeleteProperties');
    });

    it('DeleteProperty', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_DeleteProperty');
    });

    it('DoActions', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_DoActions');
    });

    it('DynamicBeginDialog', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_DynamicBeginDialog');
    });

    it('EditActionAppendActions', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_EditActionAppendActions');
    });

    it('EditActionInsertActions', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_EditActionInsertActions');
    });

    it('EditActionReplaceSequence', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_EditActionReplaceSequence');
    });

    it('EmitEvent', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_EmitEvent');
    });

    it('EndDialog', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_EndDialog');
    });

    it('Foreach_Nested', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_Foreach_Nested');
    });

    it('Foreach', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_Foreach');
    });

    it('Foreach_Empty', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_Foreach_Empty');
    });

    it('Foreach_Object', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_Foreach_Object');
    });

    it('ForeachPage_Empty', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_ForeachPage_Empty');
    });

    it('ForeachPage_Nested', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_ForeachPage_Nested');
    });

    it('ForeachPage_Partial', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_ForeachPage_Partial');
    });

    it('ForeachPage', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_ForeachPage');
    });

    it('GetActivityMembers', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_GetActivityMembers');
    });

    it('GetConversationMembers', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_GetConversationMembers');
    });

    it('GotoAction', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_GotoAction');
    });

    it('HttpRequest', async function () {
        nock('http://foo.com').post('/', 'Joe is 52').reply(200, 'string');
        nock('http://foo.com').post('/', { text: 'Joe is 52', age: 52 }).reply(200, 'object');
        nock('http://foo.com')
            .post(
                '/',
                JSON.stringify(
                    Object.assign({}, [
                        { text: 'Joe is 52', age: 52 },
                        { text: 'text', age: 11 },
                    ]),
                ),
            )
            .reply(200, 'array');
        nock('http://foo.com')
            .post('/', 'Joe is 52')
            .replyWithError({ message: 'Error making the request', code: 'FetchError' });
        nock('http://foo.com').get('/image').reply(200, 'TestImage');
        nock('http://foo.com').get('/json').reply(200, { test: 'test' });
        nock('http://foo.com').get('/activity').reply(200, MessageFactory.text('testtest'));
        nock('http://foo.com')
            .get('/activities')
            .reply(200, [MessageFactory.text('test1'), MessageFactory.text('test2'), MessageFactory.text('test3')]);
        await TestUtils.runTestScript(resourceExplorer, 'Action_HttpRequest');
    });

    it('IfCondition', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_IfCondition');
    });

    it('InputDialog_ActivityProcessed', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'InputDialog_ActivityProcessed');
    });

    it('NumerInput', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_NumberInput');
    });

    it('NumerInputWithDefaultValue', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_NumberInputWithDefaultValue');
    });

    it('NumberInputWithValueExpression', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_NumberInputWithValueExpression');
    });

    it('RepeatDialog', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_RepeatDialog');
    });

    it('RepeatDialogLoop', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_RepeatDialogLoop');
    });

    it('ReplaceDialog', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_ReplaceDialog');
    });

    it('ReplaceDialogDifferentLevel', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_ReplaceDialogDifferentLevel');
    });

    /* Temporarily disable this test because we don't allow recursive dialog yet.
    it('ReplaceDialogRecursive', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_ReplaceDialogRecursive');
    });
    */

    it('ReplaceDialogRoot', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_ReplaceDialogRoot');
    });

    it('SendActivity', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_SendActivity');
    });

    it('SendActivityWithLGAlias', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_SendActivity_LGAlias');
    });

    it('SetProperties', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_SetProperties');
    });

    it('SetProperty', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_SetProperty');
    });

    it('SignOutUser', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_SignOutUser');
    });

    it('Switch_Bool', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_Switch_Bool');
    });

    it('Switch_Default', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_Switch_Default');
    });

    it('Switch_Number', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_Switch_Number');
    });

    it('Switch', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_Switch');
    });

    it('TextInput', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_TextInput');
    });

    it('TextInputWithEmptyPrompt', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_TextInput_WithEmptyPrompt');
    });

    it('TextInputWithInvalidPrompt', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_TextInputWithInvalidPrompt');
    });

    it('TextInputWithValueExpression', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_TextInputWithValueExpression');
    });

    it('TextInputWithInvalidResponse', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_TextInputWithInvalidResponse');
    });

    it('TextInputWithNonStringInput', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_TextInputWithNonStringInput');
    });

    it('TraceActivity', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_TraceActivity');
    });

    it('ThrowException', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_ThrowException');
    });

    it('UpdateActivity', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_UpdateActivity');
    });

    it('WaitForInput', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'Action_WaitForInput');
    });
});
