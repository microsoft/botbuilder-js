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
        try {
            encrypt.encryptString(value);
            assert.fail("did not throw error or exception");
        }
        catch (Error) {
            assert.ok(true);
        }
    });

    it("DecryptWithNullSecretThrows", () => {
        let secret = encrypt.generateKey();
        let encrypted = encrypt.encryptString(value, secret);

        try {
            encrypt.decryptString(encrypted, null);
            assert.fail("did not throw error or exception");
        }
        catch (Error) {
            assert.ok(true);
        }
    });

    it("DecryptWithBadSecretThrows", () => {
        let secret = encrypt.generateKey();
        let encrypted = encrypt.encryptString(value, secret);

        try {
            encrypt.decryptString(encrypted, "bad");
            assert.fail("did not throw error or exception");
        }
        catch (Error) {
            assert.ok(true);
        }

        try {
            encrypt.decryptString(encrypted, encrypt.generateKey());
            assert.fail("Decrypt with different key should throw");
        }
        catch (Error) {
            assert.ok(true);
        }
    });
});
