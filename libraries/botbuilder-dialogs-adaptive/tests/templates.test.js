const assert = require('assert');
const {
    ConversationState,
    MemoryStorage,
    TurnContext,
    TestAdapter,
    ActivityFactory,
} = require('botbuilder-core');
const { DialogContext, DialogSet } = require('botbuilder-dialogs');
const { TextTemplate, languageGeneratorKey, TemplateEngineLanguageGenerator, ActivityTemplate, StaticActivityTemplate } = require('../lib');

describe('Templates', function() {
    this.timeout(3000);

    const conversationState = new ConversationState(new MemoryStorage());
    const dialogState = conversationState.createProperty('dialog');
    const dialogs = new DialogSet(dialogState);
    const turnContext = new TurnContext(new TestAdapter());

    it('TextTemplate should throw if template is not defined', async function() {
        const template = new TextTemplate();
        const dc = new DialogContext(dialogs, turnContext, dialogState);
        assert.rejects(() => template.bind(dc, {}));
    });

    it('TextTemplate should return undefined if language generator is not provided', async function() {
        const template = new TextTemplate('test');
        const dc = new DialogContext(dialogs, turnContext, dialogState);
        const result = await template.bind(dc, {});
        assert.strictEqual(result, undefined);
    });
    
    it('TextTemplte should return result if language generator is provided', async function() {
        const template = new TextTemplate('${test}');
        const dc = new DialogContext(dialogs, turnContext, dialogState);
        dc.services.set(languageGeneratorKey, new TemplateEngineLanguageGenerator());
        const result = await template.bind(dc, {test: 123});
        assert.strictEqual(result, '123');
    });
    
    it('TextTemplate toString', async function() {
        const template = new TextTemplate('test');
        assert.strictEqual(template.toString(), 'TextTemplate(test)');
    });
    
    it('ActivityTemplate should return undefined if template is not defined', async function() {
        const template = new ActivityTemplate();
        const dc = new DialogContext(dialogs, turnContext, dialogState);
        const result = await template.bind(dc, {});
        assert.strictEqual(result, undefined);
    });
    
    it('ActivityTemplate should return lg result if language generator is provided', async function() {
        const template = new ActivityTemplate('${test}');
        const dc = new DialogContext(dialogs, turnContext, dialogState);
        dc.services.set(languageGeneratorKey, new TemplateEngineLanguageGenerator());
        const result = await template.bind(dc, {test: 123});
        assert(result);
        assert.strictEqual(typeof result, 'object');
        assert.strictEqual(result.text, '123');
    });

    it('ActivityTemplate should return template result if language generator is not provided', async function() {
        const template = new ActivityTemplate('${test}');
        const dc = new DialogContext(dialogs, turnContext, dialogState);
        const result = await template.bind(dc, {test: 123});
        assert(result);
        assert.strictEqual(typeof result, 'object');
        assert.strictEqual(result.text, '${test}');
    });
    
    it('ActivityTemplate toString', async function() {
        const template = new ActivityTemplate('test');
        assert.strictEqual(template.toString(), 'ActivityTemplate(test)');
    });
    
    it('StaticActivityTemplate should return template as Activity', async function() {
        const activity = ActivityFactory.buildActivityFromText('test');
        const template = new StaticActivityTemplate(activity);
        const dc = new DialogContext(dialogs, turnContext, dialogState);
        const result = await template.bind(dc, {});
        assert(result);
        assert.strictEqual(result.type, activity.type);
        assert.strictEqual(result.text, activity.text);
    });

    it('StaticActivityTemplate toString', async function() {
        const activity = ActivityFactory.buildActivityFromText('test');
        const template = new StaticActivityTemplate(activity);
        assert(template.toString(), 'StaticActivityTemplate(test)');
    });
});