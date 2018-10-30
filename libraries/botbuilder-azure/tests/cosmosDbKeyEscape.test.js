const assert = require('assert');
const { CosmosDbKeyEscape } = require('../');

describe('CosmosDbKeyEscape', function() {
    it('should fail with null key', function() {
        assert.throws(() => new CosmosDbKeyEscape(), Error, 'constructor should have thrown error about missing key parameter.')
    });

    it('should fail with empty key', function() {
        assert.throws(() => new CosmosDbKeyEscape(''), Error, 'constructor should have thrown error about missing key parameter.')
    });

    it('should fail with white spaces key', function() {
        assert.throws(() => new CosmosDbKeyEscape('   '), Error, 'constructor should have thrown error about missing key parameter.')
    });

    it('should not change a valid key', function() {
        let validKey = 'Abc12345';
        let sanitizedKey = CosmosDbKeyEscape.escapeKey(validKey);
        assert.equal(validKey, sanitizedKey, `${validKey} should be equal to ${sanitizedKey}`)
    });

    it('should escape illegal characters - case with \'?\'', function() {
        // Ascii code of "?" is "3f"
        let sanitizedKey = CosmosDbKeyEscape.escapeKey('?test?');
        assert.equal(sanitizedKey, '*3ftest*3f');
    });

    it('should escape illegal characters - case with \'/\'', function() {
        // Ascii code of "/" is "2f"
        let sanitizedKey = CosmosDbKeyEscape.escapeKey('/test/');
        assert.equal(sanitizedKey, '*2ftest*2f');
    });

    it('should escape illegal characters - case with \'\\\'', function() {        
        // Ascii code of "\" is "5c"
        let sanitizedKey = CosmosDbKeyEscape.escapeKey('\\test\\');
        assert.equal(sanitizedKey, '*5ctest*5c');
    })

    it('should escape illegal characters - case with \'#\'', function() {
        // Ascii code of "#" is "23"
        let sanitizedKey = CosmosDbKeyEscape.escapeKey('#test#');
        assert.equal(sanitizedKey, '*23test*23');
    })

    it('should escape illegal characters - case with \'*\'', function() {        
        // Ascii code of "*" is "2a".
        let sanitizedKey = CosmosDbKeyEscape.escapeKey('*test*');
        assert.equal(sanitizedKey, '*2atest*2a');
    });

    it('should escape illegal characters - compound key', function() {
        // Check a compound key
        let compoundSanitizedKey = CosmosDbKeyEscape.escapeKey('?#/');
        assert.equal(compoundSanitizedKey, '*3f*23*2f');
    });

    it('should handle possible collisions', function() {
        let validKey1 = '*2atest*2a';
        let validKey2 = '*test*';

        let escaped1 = CosmosDbKeyEscape.escapeKey(validKey1);
        let escaped2 = CosmosDbKeyEscape.escapeKey(validKey2);
        
        assert.notEqual(escaped1, escaped2, `${escaped1} should be different that ${escaped2}`)
    });
});