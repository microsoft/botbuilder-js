let assert = require('assert');
let encrypt = require('../lib/encrypt');

describe("EncryptionTests", () => {
    const secret = "lgCbJPXnfOlatjbBDKMbh0ie6bc8PD/cjqA/2tPgMS0=";
    const value = "1234567890";

    function encriptDecriptString(value, secret) {
        let encrypted = encrypt.encryptString(value, secret);
        assert.ok(value != encrypted, "encryption failed");

        let decrypted = encrypt.decryptString(encrypted, secret);
        assert.ok(value === decrypted, "decryption failed");
    };

    function encriptDecriptStringDoesNothing(value, secret) {
        let encrypted = encrypt.encryptString(value, secret);
        assert.ok(value == encrypted, "encryption failed");

        let decrypted = encrypt.decryptString(encrypted, secret);
        assert.ok(value === decrypted, "decryption failed");
    };

    it("EncryptDecrypt", () => {
        encriptDecriptString(value, secret);
    });

    it("EncryptDecryptEmptyDoesNothing", () => {
        let value = "";
        encriptDecriptStringDoesNothing(value, secret);
    });

    it("EncryptDecryptNullDoesNothing", () => {
        let value = null;
        encriptDecriptStringDoesNothing(value, secret);
    });

    it("EncryptDecryptUndefinedDoesNothing", () => {
        let value = undefined;
        encriptDecriptStringDoesNothing(value, secret);
    });

    it("GenerateKeyWorks", () => {
        let secret = encrypt.generateKey();
        encriptDecriptString(value, secret)
    });

    it("EncryptWithNullSecretThrows", () => {
        assert.throws(
            () => encrypt.encryptString(value),
            new Error('you must pass a secret')
        );
    });

    it("DecryptWithNullSecretThrows", () => {
        let secret = encrypt.generateKey();
        let encrypted = encrypt.encryptString(value, secret);

        assert.throws(
            () => encrypt.decryptString(encrypted, null),
            new Error('you must pass a secret')
        );
    });

    it("DecryptWithBadSecretThrows", () => {
        let secret = encrypt.generateKey();
        let encrypted = encrypt.encryptString(value, secret);

        assert.throws(
            () => encrypt.decryptString(encrypted, "bad"),
            new Error('The secret is not valid format')
        );

        assert.throws(
            () => encrypt.decryptString(encrypted, encrypt.generateKey()),
            new Error('error:06065064:digital envelope routines:EVP_DecryptFinal_ex:bad decrypt')
        );
    });
});
