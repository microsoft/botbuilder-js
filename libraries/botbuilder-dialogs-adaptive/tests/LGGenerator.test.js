const {
    MultiLanguageGenerator,
    LanguageResourceLoader,
    TemplateEngineLanguageGenerator,
    LanguageGeneratorMiddleWare,
    LanguageGeneratorManager,
    ResourceMultiLanguageGenerator } = require('../');
const { ResourceExplorer } = require('botbuilder-dialogs-declarative');
const assert = require('assert');
const { TestAdapter, TurnContext } = require('botbuilder-core');
const { DialogContext, DialogSet } = require('botbuilder-dialogs');

function GetExampleFilePath() {
    return `${__dirname}/tests/`;
}

const resourceExplorer = new ResourceExplorer().loadProject(GetExampleFilePath(), [], false);
//resourceExplorer.getResource('test.lg').then(e => e.readText().then(f => console.log(f)));

class MockLanguageGegerator {
    generate(turnContex, template, data) {
        return Promise.resolve(template);
    }
}

async function getTurnContext(locale, generator) {
    const context = await new TurnContext(
        await new TestAdapter().use(
            await new LanguageGeneratorMiddleWare(resourceExplorer, generator ? generator : new MockLanguageGegerator())), { locale: locale, text: '' });
    const lgm = new LanguageGeneratorManager(resourceExplorer);
    await lgm.loadResources();
    context.turnState.set('LanguageGeneratorManager', lgm);
    if (generator !== undefined) {
        context.turnState.set('LanguageGenerator', generator);
    }

    return context;
}

async function getDialogContext(locale, generator) {
    const turnContext = await getTurnContext(locale, generator);
    return new DialogContext(new DialogSet(), turnContext, { dialogStack: [] });
}

describe('LGLanguageGenerator', function() {
    this.timeout(10000);

    it('TestNotFoundTemplate', async function() {
        const context = getDialogContext('');
        const lg = new TemplateEngineLanguageGenerator();
        assert.throws(() => {lg.generate(context, '${tesdfdfsst()}', undefined);}, Error);
    });

    describe('TestMultiLangImport', () => {
        let lgResourceGroup;
        this.beforeAll(async function() {
            lgResourceGroup = await LanguageResourceLoader.groupByLocale(resourceExplorer);
        });
        describe('Test MultiLang Import with specified locale', async function() {
            let generator;
            let dialogContext;
            this.beforeAll(async function() {
                const resource = await resourceExplorer.getResource('a.en-US.lg');
                generator = new TemplateEngineLanguageGenerator(resource.fullName, lgResourceGroup);
                dialogContext = await getDialogContext();
            });

            it('"${templatea()}", no data', async () => {
                const result = await generator.generate(dialogContext, '${templatea()}', undefined);
                assert.strictEqual(result, 'from a.en-us.lg');
            });

            it('"${templateb()}", no data', async () => {
                const result = await generator.generate(dialogContext, '${templateb()}', undefined);
                assert.strictEqual(result, 'from b.en-us.lg');
            });

            it('"${templatec()}", no data', async () => {
                const result = await generator.generate(dialogContext, '${templatec()}', undefined);
                assert.strictEqual(result, 'from c.en.lg');
            });

            it('should throw for missing template: "${greeting()}", no data', async () => {
                assert.throws(() => {generator.generate(dialogContext, '${greeting()}', undefined);});
            });       
        });
        
        describe('Test Multi-Language Import with no locale', function() {   
            let generator; 
            this.beforeAll(async function() {
                const resource = await resourceExplorer.getResource('a.lg');
                generator = new TemplateEngineLanguageGenerator(resource.fullName, lgResourceGroup);
            });

            it('"${templatea()}", no data', async () => {
                const result = await generator.generate(await getDialogContext(), '${templatea()}', undefined);
                assert.strictEqual(result, 'from a.lg');
            });

            it('"${templateb()}", no data', async () => {
                const result = await generator.generate(await getDialogContext(), '${templateb()}', undefined);
                assert.strictEqual(result, 'from b.lg');
            });

            it('"${templatec()}", no data', async () => {
                const result = await generator.generate(await getDialogContext(), '${templatec()}', undefined);
                assert.strictEqual(result, 'from c.lg');
            });

            it('"${greeting()}", no data', async () => {
                const result = await generator.generate(await getDialogContext(), '${greeting()}', undefined);
                assert.strictEqual(result, 'hi');
            });    
        });
    });

    describe('TestMultiLangGenerator', () => {
        const lg = new MultiLanguageGenerator();

        this.beforeAll(async function() {
            const multiLanguageResources = await LanguageResourceLoader.groupByLocale(resourceExplorer);
        
            let resource = await resourceExplorer.getResource('test.lg');
            let text = await resource.readText();
        
            lg.languageGenerators.set('', new TemplateEngineLanguageGenerator(text, 'test.lg', multiLanguageResources));
        
            resource = await resourceExplorer.getResource('test.de.lg');
            text = await resource.readText();
            lg.languageGenerators.set('de', new TemplateEngineLanguageGenerator(text, 'test.de.lg', multiLanguageResources));
        
            resource = await resourceExplorer.getResource('test.en.lg');
            text = await resource.readText();
            lg.languageGenerators.set('en', new TemplateEngineLanguageGenerator(text, 'test.en.lg', multiLanguageResources));
        
            resource = await resourceExplorer.getResource('test.en-US.lg');
            text = await resource.readText();
            lg.languageGenerators.set('en-us', new TemplateEngineLanguageGenerator(text, 'test.en-US.lg', multiLanguageResources));
        
            resource = await resourceExplorer.getResource('test.en-GB.lg');
            text = await resource.readText();
            lg.languageGenerators.set('en-gb', new TemplateEngineLanguageGenerator(text, 'test.en-GB.lg', multiLanguageResources));
        
            resource = await resourceExplorer.getResource('test.fr.lg');
            text = await resource.readText();
            lg.languageGenerators.set('fr', new TemplateEngineLanguageGenerator(text, 'test.fr.lg', multiLanguageResources));
        });

        it('en-US, "${test()}", no data', async () => {
            const result1 = await lg.generate(await getDialogContext('en-US'), '${test()}', undefined);
            assert.equal(result1, 'english-us');
        });

        it('en-GB, "${test()}", no data', async () => {
            const result2 = await lg.generate(await getDialogContext('en-GB'), '${test()}', undefined);
            assert.equal(result2, 'english-gb');
        });

        it('en, "${test()}", no data', async () => {
            const result3 = await lg.generate(await getDialogContext('en'), '${test()}', undefined);
            assert.equal(result3, 'english');
        });

        it('no locale, "${test()}", no data', async () => {
            const result4 = await lg.generate(await getDialogContext(''), '${test()}', undefined);
            assert.equal(result4, 'default');
        });

        it('bad locale, "${test()}", no data', async () => {
            const result5 = await lg.generate(await getDialogContext('foo'), '${test()}', undefined);
            assert.equal(result5, 'default');
        });

        it('en-US, "${test2()}", country data', async () => {
            const result6 = await lg.generate(await getDialogContext('en-US'), '${test2()}', {country: 'US'});
            assert.equal(result6, 'english-US');
        });

        it('en-GB, "${test2()}", no data', async () => {
            const result7 = await lg.generate(await getDialogContext('en-GB'), '${test2()}', undefined);
            assert.equal(result7, 'default2');
        });

        it('en, "${test2()}", no data', async () => {
            const result8 = await lg.generate(await getDialogContext('en'), '${test2()}', undefined);
            assert.equal(result8, 'default2');
        });

        it('no locale, "${test2()}", no data', async () => {
            const result9 = await lg.generate(await getDialogContext(''), '${test2()}', undefined);
            assert.equal(result9, 'default2');
        });

        it('bad locale, "${test2()}", no data', async () => {
            const result10 = await lg.generate(await getDialogContext('foo'), '${test2()}', undefined);
            assert.equal(result10, 'default2');
        });
    });

    describe('TestResourceMultiLangGenerator', () => {
        const lg = new ResourceMultiLanguageGenerator('test.lg');
/*
        it('en-us, "${test()}", no data', async () => {
            const result1 = await lg.generate(await getTurnContext('en-us', lg), '${test()}', undefined);
            assert.equal(result1, 'english-us');
        });

        it('en-us, "${test()}", country data', async () => {
            const result2 = await lg.generate(await getTurnContext('en-us', lg), '${test()}', { country: 'us' });
            assert.equal(result2, 'english-us');
        });

        it('en-gb, "${test()}", no data', async () => {
            const result3 = await lg.generate(await getTurnContext('en-gb', lg), '${test()}', undefined);
            assert.equal(result3, 'english-gb');
        });
*/
        it('en, "${test()}", no data', async () => {
            const result4 = await lg.generate(await getDialogContext('en', lg), '${test()}', undefined);
            assert.equal(result4, 'english');
        });

        it('no locale, "${test()}", no data', async () => {
            const result5 = await lg.generate(await getDialogContext('', lg), '${test()}', undefined);
            assert.equal(result5, 'default');
        });

        it('bad locale, "${test()}", no data', async () => {
            const result6 = await lg.generate(await getDialogContext('foo', lg), '${test()}', undefined);
            assert.equal(result6, 'default');
        });

        it('en-gb, "${test2()}", no data', async () => {
            const result7 = await lg.generate(await getDialogContext('en-gb', lg), '${test2()}', undefined);
            assert.equal(result7, 'default2');
        });

        it('en, "${test2()}", no data', async () => {
            const result8 = await lg.generate(await getDialogContext('en', lg), '${test2()}', undefined);
            assert.equal(result8, 'default2');
        });

        it('no locale, "${test2()}", no data', async () => {
            const result9 = await lg.generate(await getDialogContext('', lg), '${test2()}', undefined);
            assert.equal(result9, 'default2');
        });

        it('bad locale, "${test2()}", no data', async () => {
            const result10 = await lg.generate(await getDialogContext('foo', lg), '${test2()}', undefined);
            assert.equal(result10, 'default2');
        });
/*
        it('en-us, "${test2()}", country data', async () => {
            const result11 = await lg.generate(await getTurnContext('en-us', lg), '${test2()}', {country: 'US'});
            assert.equal(result11, 'english-US');
        });
*/
    });
});