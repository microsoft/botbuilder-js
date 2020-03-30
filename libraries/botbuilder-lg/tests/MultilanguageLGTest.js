const { MultiLanguageLG } = require(`../`);
const assert = require(`assert`);

describe('MultilanguageLGTest', function() {
    it('TestMultiLanguageLG', function() {
        const localPerFile = new Map();
        localPerFile.set('en', `${ __dirname }/testData/MultiLanguage/a.en.lg`);
        localPerFile.set('', `${ __dirname }/testData/MultiLanguage/a.lg`);

        const generator = new MultiLanguageLG(localPerFile);
        
        // fallback to "a.en.lg"
        let result = generator.generate('${templatec()}', undefined, 'en-us');
        assert.strictEqual(result, 'from a.en.lg');
        
        // "a.en.lg" is used
        result = generator.generate('${templatec()}', undefined, 'en');
        assert.strictEqual(result, 'from a.en.lg');

        // locale "fr" has no entry file, default file "a.lg" is used
        result = generator.generate('${templatec()}', undefined, 'fr');
        assert.strictEqual(result, 'from a.lg');

        // "a.lg" is used
        result = generator.generate('${templatec()}');
        assert.strictEqual(result, 'from a.lg');
    });
});
