const { MultiLanguageLG, Templates} = require(`../`);
const assert = require(`assert`);

describe('MultilanguageLGTest', function() {
    it('EmptyFallbackLocale', function() {
        const localPerFile = new Map();
        localPerFile.set('en', `${ __dirname }/testData/MultiLanguage/a.en.lg`);
        localPerFile.set('', `${ __dirname }/testData/MultiLanguage/a.lg`);

        const generator = new MultiLanguageLG(undefined, localPerFile);
        
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
        const localPerFile = new Map();
        localPerFile.set('en', `${ __dirname }/testData/MultiLanguage/a.en.lg`);

        const generator = new MultiLanguageLG(undefined, localPerFile, 'en');
        
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

    it('SpecificFallbackLocale', function() {
        const enTemplates = Templates.parseText('[import](1.lg)\r\n # template\r\n - hi', 'abc', defaultFileResolver);
        const templatesDict = new Map();
        templatesDict.set('en', enTemplates);

        const generator = new MultiLanguageLG(templatesDict, undefined, 'en');
        
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

    function defaultFileResolver(sourceId, resourceId) {
        return { content: `# myTemplate\r\n - content with id: ${ resourceId } from source: ${ sourceId }`, id : sourceId + resourceId };
    }
});
