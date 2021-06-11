const nock = require('nock');
const { ActivityTypes, MessageFactory, SkillConversationIdFactoryBase, TurnContext } = require('botbuilder-core');
const { TestUtils } = require('..');
const { createHash } = require('crypto');
const { makeResourceExplorer } = require('./utils');

const {
    LanguageGenerationBotComponent,
    skillConversationIdFactoryKey,
    skillClientKey,
} = require('botbuilder-dialogs-adaptive');

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
        const key = createHash('md5')
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
        const key = createHash('md5')
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

    it('AttachmentInput', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_AttachmentInput');
    });

    it('BeginDialog', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_BeginDialog');
    });

    it('BeginDialogWithExpr', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_BeginDialogWithExpr');
    });

    it('BeginDialogWithExpr2', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_BeginDialogWithExpr2');
    });

    it('BeginDialogWithExpr3', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_BeginDialogWithExpr3');
    });

    it('BeginDialogWithActivity', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_BeginDialogWithActivity');
    });

    it('BeginSkill', async () => {
        await TestUtils.runTestScript(
            resourceExplorer,
            'Action_BeginSkill',
            undefined,
            undefined,
            new SetSkillConversationIdFactoryBaseMiddleware(),
            new SetSkillBotFrameworkClientMiddleware()
        );
    });

    it('BeginSkillEndDialog', async () => {
        await TestUtils.runTestScript(
            resourceExplorer,
            'Action_BeginSkillEndDialog',
            undefined,
            undefined,
            new SetSkillConversationIdFactoryBaseMiddleware(),
            new SetSkillBotFrameworkClientMiddleware()
        );
    });

    it('CancelAllDialogs', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_CancelAllDialogs');
    });

    it('CancelAllDialogs_DoubleCancel', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_CancelAllDialogs_DoubleCancel');
    });

    it('CancelDialog', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_CancelDialog');
    });

    it('CancelDialogs_Processed', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_CancelDialog_Processed');
    });

    it('ChoiceInput', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_ChoiceInput');
    });

    it('ChoiceInputWithLocale', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_ChoiceInput_WithLocale');
    });

    it('ChoicesInMemory', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_ChoicesInMemory');
    });

    it('ChoiceInputSimpleTemplate_en', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_ChoiceInput_SimpleTemplate_en');
    });

    it('ChoiceInputSimpleTemplate_es', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_ChoiceInput_SimpleTemplate_es');
    });

    it('ChoiceInputComplexTemplate_en', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_ChoiceInput_ComplexTemplate_en');
    });

    it('ChoiceInputComplexTemplate_es', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_ChoiceInput_ComplexTemplate_es');
    });

    it('ChoiceStringInMemory', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_ChoiceStringInMemory');
    });

    it('ConfirmInput', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_ConfirmInput');
    });

    it('DeleteActivity', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_DeleteActivity');
    });

    it('DatetimeInput', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_DatetimeInput');
    });

    it('ConfirmInputSimpleTemplate_en', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_ConfirmInput_SimpleTemplate_en');
    });

    it('ConfirmInputComplexTemplate_en', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_ConfirmInput_ComplexTemplate_en');
    });

    it('ConfirmInputSimpleTemplate_es', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_ConfirmInput_SimpleTemplate_es');
    });

    it('ConfirmInputComplexTemplate_es', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_ConfirmInput_ComplexTemplate_es');
    });

    it('DeleteProperties', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_DeleteProperties');
    });

    it('DeleteProperty', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_DeleteProperty');
    });

    it('DoActions', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_DoActions');
    });

    it('DynamicBeginDialog', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_DynamicBeginDialog');
    });

    it('EditActionAppendActions', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_EditActionAppendActions');
    });

    it('EditActionInsertActions', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_EditActionInsertActions');
    });

    it('EditActionReplaceSequence', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_EditActionReplaceSequence');
    });

    it('EmitEvent', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_EmitEvent');
    });

    it('EndDialog', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_EndDialog');
    });

    it('Foreach_Nested', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_Foreach_Nested');
    });

    it('Foreach', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_Foreach');
    });

    it('Foreach_Empty', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_Foreach_Empty');
    });

    it('ForeachPage_Empty', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_ForeachPage_Empty');
    });

    it('ForeachPage_Nested', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_ForeachPage_Nested');
    });

    it('ForeachPage_Partial', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_ForeachPage_Partial');
    });

    it('ForeachPage', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_ForeachPage');
    });

    it('GetActivityMembers', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_GetActivityMembers');
    });

    it('GetConversationMembers', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_GetConversationMembers');
    });

    it('GotoAction', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_GotoAction');
    });

    it('HttpRequest', async () => {
        nock('http://foo.com').post('/', 'Joe is 52').reply(200, 'string');
        nock('http://foo.com').post('/', { text: 'Joe is 52', age: 52 }).reply(200, 'object');
        nock('http://foo.com')
            .post('/', [
                { text: 'Joe is 52', age: 52 },
                { text: 'text', age: 11 },
            ])
            .reply(200, 'array');
        nock('http://foo.com').get('/image').reply(200, 'TestImage');
        nock('http://foo.com').get('/json').reply(200, { test: 'test' });
        nock('http://foo.com').get('/activity').reply(200, MessageFactory.text('testtest'));
        nock('http://foo.com')
            .get('/activities')
            .reply(200, [MessageFactory.text('test1'), MessageFactory.text('test2'), MessageFactory.text('test3')]);
        await TestUtils.runTestScript(resourceExplorer, 'Action_HttpRequest');
    });

    it('IfCondition', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_IfCondition');
    });

    it('InputDialog_ActivityProcessed', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'InputDialog_ActivityProcessed');
    });

    it('NumerInput', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_NumberInput');
    });

    it('NumerInputWithDefaultValue', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_NumberInputWithDefaultValue');
    });

    it('NumberInputWithValueExpression', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'Action_NumberInputWithValueExpression');
    });

});
