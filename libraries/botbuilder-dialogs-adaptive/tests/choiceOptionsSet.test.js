const assert = require('assert');
const { stub } = require('sinon');
const { ChoiceOptionsSet, MultiLanguageGenerator } = require('../');
const { languageGeneratorKey } = require('../lib/languageGeneratorExtensions');
const { MessageFactory, TurnContext, TestAdapter } = require('botbuilder');
const { DialogContext, DialogSet } = require('botbuilder-dialogs');

describe('ChoiceOptionsSet', function () {
    this.timeout(10000);

    const template = '=${options.OrSeparator()}';
    const activity = MessageFactory.text('hi');

    it('ContructorValidation', function () {
        assert.notStrictEqual(new ChoiceOptionsSet(), null);
        assert.notStrictEqual(new ChoiceOptionsSet(template), null);
    });

    it('BindNullTemplate', async function () {
        const choiceOptions = new ChoiceOptionsSet(null);
        const context = new TurnContext(new TestAdapter(), activity);
        const dc = new DialogContext(new DialogSet(), context, {});

        const choiceFactory = await choiceOptions.bind(dc);

        assert.strictEqual(choiceFactory, choiceOptions);
    });

    it('BindNullLanguageGenerator', async function () {
        const choiceOptions = new ChoiceOptionsSet(template);
        const context = new TurnContext(new TestAdapter(), activity);
        const dc = new DialogContext(new DialogSet(), context, {});

        await assert.rejects(() => choiceOptions.bind(dc), new Error('language generator is missing.'));
    });

    it('BindReturnsLGResult', async function () {
        const choiceOptions = new ChoiceOptionsSet(template);
        const context = new TurnContext(new TestAdapter(), activity);
        const dc = new DialogContext(new DialogSet(), context, {});

        const lg = new MultiLanguageGenerator();
        const generateStub = stub(lg, 'generate');
        generateStub.returns(choiceOptions);
        dc.services.set(languageGeneratorKey, lg);

        const choiceFactory = await choiceOptions.bind(dc);

        assert.strictEqual(choiceFactory, choiceOptions);
    });

    it('BindReturnsChoiceFactoryOptions', async function () {
        const choiceOptions = new ChoiceOptionsSet(template);
        const context = new TurnContext(new TestAdapter(), activity);
        const dc = new DialogContext(new DialogSet(), context, {});
        const lgResult = '[","," or",", or",true]';

        const lg = new MultiLanguageGenerator();
        const generateStub = stub(lg, 'generate');
        generateStub.returns(lgResult);
        dc.services.set(languageGeneratorKey, lg);

        const choiceFactory = await choiceOptions.bind(dc);

        assert.strictEqual(choiceFactory.inlineSeparator, ',');
        assert.strictEqual(choiceFactory.inlineOrMore, ', or');
        assert.strictEqual(choiceFactory.inlineOr, ' or');
        assert.strictEqual(choiceFactory.includeNumbers, true);
    });

    it('BindThrowsJsonError', async function () {
        const choiceOptions = new ChoiceOptionsSet(template);
        const context = new TurnContext(new TestAdapter(), activity);
        const dc = new DialogContext(new DialogSet(), context, {});
        const lgResult = '[","," or",", or",true]]';

        const lg = new MultiLanguageGenerator();
        const generateStub = stub(lg, 'generate');
        generateStub.returns(lgResult);
        dc.services.set(languageGeneratorKey, lg);

        const choiceFactory = await choiceOptions.bind(dc);

        assert.strictEqual(choiceFactory, null);
    });

    it('BindReturnsNull', async function () {
        const choiceOptions = new ChoiceOptionsSet(template);
        const context = new TurnContext(new TestAdapter(), activity);
        const dc = new DialogContext(new DialogSet(), context, {});

        const lg = new MultiLanguageGenerator();
        const generateStub = stub(lg, 'generate');
        generateStub.returns(null);
        dc.services.set(languageGeneratorKey, lg);

        const choiceFactory = await choiceOptions.bind(dc);

        assert.strictEqual(choiceFactory, null);
    });
});
