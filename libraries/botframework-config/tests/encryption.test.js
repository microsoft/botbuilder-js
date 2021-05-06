const assert = require('assert');
const encrypt = require('../lib/encrypt');

describe('EncryptionTests', function () {
    const secret = 'lgCbJPXnfOlatjbBDKMbh0ie6bc8PD/cjqA/2tPgMS0=';
    const value = '1234567890';

    function encryptDecryptString(value, secret) {
        const encrypted = encrypt.encryptString(value, secret);
        assert.ok(value != encrypted, 'encryption failed');

        const decrypted = encrypt.decryptString(encrypted, secret);
        assert.ok(value === decrypted, 'decryption failed');
    }

    function encryptDecryptStringDoesNothing(value, secret) {
        const encrypted = encrypt.encryptString(value, secret);
        assert.ok(value == encrypted, 'encryption failed');

        const decrypted = encrypt.decryptString(encrypted, secret);
        assert.ok(value === decrypted, 'decryption failed');
    }

    it('EncryptDecrypt', function () {
        encryptDecryptString(value, secret);
    });

    it('EncryptDecryptEmptyDoesNothing', function () {
        const value = '';
        encryptDecryptStringDoesNothing(value, secret);
    });

    it('EncryptDecryptNullDoesNothing', function () {
        const value = null;
        encryptDecryptStringDoesNothing(value, secret);
    });

    it('EncryptDecryptUndefinedDoesNothing', function () {
        const value = undefined;
        encryptDecryptStringDoesNothing(value, secret);
    });

    it('GenerateKeyWorks', function () {
        const secret = encrypt.generateKey();
        encryptDecryptString(value, secret);
    });

    it('EncryptWithNullSecretThrows', function () {
        assert.throws(() => encrypt.encryptString(value), new Error('you must pass a secret'));
    });

    it('DecryptWithNullSecretThrows', function () {
        const secret = encrypt.generateKey();
        const encrypted = encrypt.encryptString(value, secret);

        assert.throws(() => encrypt.decryptString(encrypted, null), new Error('you must pass a secret'));
    });

    it('DecryptWithBadSecretThrows', function () {
        const secret = encrypt.generateKey();
        const encrypted = encrypt.encryptString(value, secret);

        assert.throws(() => encrypt.decryptString(encrypted, 'bad'), new Error('The secret is not valid format'));

        assert.throws(
            () => encrypt.decryptString(encrypted, encrypt.generateKey()),
            new Error('error:06065064:digital envelope routines:EVP_DecryptFinal_ex:bad decrypt')
        );
    });
});
