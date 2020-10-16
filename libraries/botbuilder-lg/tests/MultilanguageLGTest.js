const { MultiLanguageLG, Templates, LGResource} = require(`../`);
const assert = require(`assert`);
const { LanguageResourceLoader } = require("../../botbuilder-dialogs-adaptive/lib");

describe('MultilanguageLGTest', function() {
    /**
     * Disk I/O is slow and variable, causing issues in pipeline tests, so we
     * preload all of the file reads here so that it doesn't count against individual test duration.
     */
    const preloaded = {
        EmptyFallbackLocale: function() {
            const localPerFile = new Map();
            localPerFile.set('en', `${ __dirname }/testData/MultiLanguage/a.en.lg`);
            localPerFile.set('', `${ __dirname }/testData/MultiLanguage/a.lg`);

            return new MultiLanguageLG(undefined, localPerFile);
        }(),
        SpecificFallbackLocale: function() {
            const localPerFile = new Map();
            localPerFile.set('en', `${ __dirname }/testData/MultiLanguage/a.en.lg`);

            return new MultiLanguageLG(undefined, localPerFile, 'en');
        }(),
        SpecificFallbackLocale2: function() {
            const enTemplates = Templates.parseResource(new LGResource('abc', 'abc', '[import](1.lg)\r\n # template\r\n - hi'), defaultFileResolver);
            const templatesDict = new Map();
            templatesDict.set('en', enTemplates);

            return new MultiLanguageLG(templatesDict, undefined, 'en');
        }()
    };

    it('EmptyFallbackLocale', function() {
        const localPerFile = new Map();
        localPerFile.set('en', `${ __dirname }/testData/MultiLanguage/a.en.lg`);
        localPerFile.set('', `${ __dirname }/testData/MultiLanguage/a.lg`);

        const generator = preloaded.EmptyFallbackLocale;
        
        // fallback to "a.en.lg"
        let result = generator.generate('templatec', undefined, 'en-us');
        assert.strictEqual(result, 'from a.en.lg');
        
        // "a.en.lg" is used
        result = generator.generate('templatec', undefined, 'en');
        assert.strictEqual(result, 'from a.en.lg');

        // locale "fr" has no entry file, default file "a.lg" is used
        result = generator.generate('templatec', undefined, 'fr');
        assert.strictEqual(result, 'from a.lg');

        // "a.lg" is used
        result = generator.generate('templatec');
        assert.strictEqual(result, 'from a.lg');
    });

    it('SpecificFallbackLocale', function() {
        const generator = preloaded.SpecificFallbackLocale;
        
        // fallback to "a.en.lg"
        let result = generator.generate('templatec', undefined, 'en-us');
        assert.strictEqual(result, 'from a.en.lg');
        
        // "a.en.lg" is used
        result = generator.generate('templatec', undefined, 'en');
        assert.strictEqual(result, 'from a.en.lg');

        // locale "fr" has no entry file, default file "a.en.lg" is used
        result = generator.generate('templatec', undefined, 'fr');
        assert.strictEqual(result, 'from a.en.lg');

        // "a.en.lg" is used
        result = generator.generate('templatec');
        assert.strictEqual(result, 'from a.en.lg');
    });

    it('SpecificFallbackLocale2', function() {
        const generator = preloaded.SpecificFallbackLocale2;
        
        // fallback to "a.en.lg"
        let result = generator.generate('myTemplate', undefined, 'en-us');
        assert.strictEqual(result, 'content with id: 1.lg from source: abc');
        
        // "a.en.lg" is used
        result = generator.generate('myTemplate', undefined, 'en');
        assert.strictEqual(result, 'content with id: 1.lg from source: abc');

        // locale "fr" has no entry file, default file "a.en.lg" is used
        result = generator.generate('myTemplate', undefined, 'fr');
        assert.strictEqual(result, 'content with id: 1.lg from source: abc');

        // "a.en.lg" is used
        result = generator.generate('myTemplate');
        assert.strictEqual(result, 'content with id: 1.lg from source: abc');
    });

    function defaultFileResolver(lgResource, resourceId) {
        const id = lgResource.id + resourceId;
        const content = `# myTemplate\r\n - content with id: ${ resourceId } from source: ${ lgResource.id }`;
        return new LGResource(id, id, content);
    }
});
