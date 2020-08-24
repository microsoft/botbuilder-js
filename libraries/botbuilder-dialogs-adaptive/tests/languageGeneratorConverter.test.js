const { ResourceMultiLanguageGenerator } = require('../');
const { LanguageGeneratorConverter } = require('../lib/converters');
const { ok, strictEqual } = require('assert');

describe('LanguageGeneratorConverter', function() {
    it('convert() should return new ResourceMultiLanguageGenerator with string param', () => {
        const converter = new LanguageGeneratorConverter();
        const newGenerator = converter.convert('');
        ok(newGenerator instanceof ResourceMultiLanguageGenerator, 'expected newGenerator to be instance of ResourceMultiLanguageGenerator');
    });

    it('convert() should return param if param type is not string', () => {
        const firstGenerator = new ResourceMultiLanguageGenerator('resourceId');
        const converter = new LanguageGeneratorConverter();
        const newGenerator = converter.convert(firstGenerator);
        strictEqual(newGenerator, firstGenerator);

        // Bad generator scenarios:
        const undefinedGenerator = converter.convert(undefined);
        strictEqual(undefinedGenerator, undefined);

        const numberGenerator = converter.convert(2);
        strictEqual(numberGenerator, 2);

    });
});
