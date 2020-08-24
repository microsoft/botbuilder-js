const assert = require('assert');
const { CosmosDbKeyEscape } = require('../');

describe('CosmosDbKeyEscape', function() {
    it('should fail with null key', function() {
        assert.throws(() => new CosmosDbKeyEscape(), Error, 'constructor should have thrown error about missing key parameter.');
    });

    it('should fail with empty key', function() {
        assert.throws(() => new CosmosDbKeyEscape(''), Error, 'constructor should have thrown error about missing key parameter.');
    });

    it('should fail with white spaces key', function() {
        assert.throws(() => new CosmosDbKeyEscape('   '), Error, 'constructor should have thrown error about missing key parameter.');
    });

    it('should not change a valid key', function() {
        let validKey = 'Abc12345';
        let sanitizedKey = CosmosDbKeyEscape.escapeKey(validKey);
        assert.equal(validKey, sanitizedKey, `${ validKey } should be equal to ${ sanitizedKey }`);
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
    });

    it('should escape illegal characters - case with \'#\'', function() {
        // Ascii code of "#" is "23"
        let sanitizedKey = CosmosDbKeyEscape.escapeKey('#test#');
        assert.equal(sanitizedKey, '*23test*23');
    });

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
        
        assert.notEqual(escaped1, escaped2, `${ escaped1 } should be different that ${ escaped2 }`);
    });

    it ('should truncate longer keys', function() {

        // create an extra long key
        // limit is 255
        let longKey = new Array(300).join('x');
        let fixed = CosmosDbKeyEscape.escapeKey(longKey);
        
        assert(fixed.length <= 255, 'long key was not properly truncated');

    });

    it ('should not truncate short key', function() {

        // create a short key
        let shortKey = new Array(16).join('x');
        let fixed2 = CosmosDbKeyEscape.escapeKey(shortKey);

        assert(fixed2.length === 15, 'short key was truncated improperly');
    });

    it ('should create sufficiently different truncated keys of similar origin', function() {

        // create 2 very similar extra long key where the difference will definitely be trimmed off by truncate function
        let longKey = new Array(300).join('x') + '1';
        let longKey2 = new Array(300).join('x') + '2';
        
        let fixed = CosmosDbKeyEscape.escapeKey(longKey);
        let fixed2 = CosmosDbKeyEscape.escapeKey(longKey2);
        
        assert(fixed.length !== fixed2, 'key truncation failed to create unique key');

    });

    it ('should properly truncate keys with special chars', function() {

        // create a short key
        let longKey = new Array(300).join('*');
        let fixed = CosmosDbKeyEscape.escapeKey(longKey);

        assert(fixed.length <= 255, 'long key with special char was truncated improperly');

        // create a short key
        let shortKey = new Array(16).join('#');
        let fixed2 = CosmosDbKeyEscape.escapeKey(shortKey);

        assert(fixed2.length <= 255, 'short key with special char was truncated improperly');
    });

});
