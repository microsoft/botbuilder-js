let assert = require('assert');
let encrypt = require('../lib/encrypt');

describe("EncryptionTests", () => {
    it("EncryptDecrypt", () => {
        let secret = "lgCbJPXnfOlatjbBDKMbh0ie6bc8PD/cjqA/2tPgMS0=";
        let value = "1234567890";
        let encrypted = encrypt.encryptString(value, secret);
        assert.ok(value != encrypted, "encryption failed");

        let decrypted = encrypt.decryptString(encrypted, secret);
        assert.ok(value === decrypted, "decryption failed");
    });

    it("EncryptDecryptEmptyDoesNothing", () => {
        let secret = "lgCbJPXnfOlatjbBDKMbh0ie6bc8PD/cjqA/2tPgMS0=";
        let value = "";
        let encrypted = encrypt.encryptString(value, secret);
        assert.ok(value == encrypted, "encryption failed");

        let decrypted = encrypt.decryptString(encrypted, secret);
        assert.ok(value === decrypted, "decryption failed");
    });

    it("EncryptDecryptNullDoesNothing", () => {
        let secret = "lgCbJPXnfOlatjbBDKMbh0ie6bc8PD/cjqA/2tPgMS0=";
        let value = null;
        let encrypted = encrypt.encryptString(value, secret);
        assert.ok(value == encrypted, "encryption failed");

        let decrypted = encrypt.decryptString(encrypted, secret);
        assert.ok(value === decrypted, "decryption failed");
    });

    it("EncryptDecryptUndefinedDoesNothing", () => {
        let secret = "lgCbJPXnfOlatjbBDKMbh0ie6bc8PD/cjqA/2tPgMS0=";
        let value = undefined;
        let encrypted = encrypt.encryptString(value, secret);
        assert.ok(value == encrypted, "encryption failed");

        let decrypted = encrypt.decryptString(encrypted, secret);
        assert.ok(value === decrypted, "decryption failed");
    });

    it("GenerateKeyWorks", () => {
        let secret = encrypt.generateKey();
        let value = "1234567890";
        let encrypted = encrypt.encryptString(value, secret);
        assert.ok(value != encrypted, "encryption failed");

        let decrypted = encrypt.decryptString(encrypted, secret);
        assert.ok(value === decrypted, "decryption failed");
    });

    it("EncryptWithNullSecretThrows", () => {
        let value = "1234567890";
        try {
            encrypt.encryptString(value);
            assert.fail("did not throw error or exception");
        }
        catch (Error) {
            assert.ok(true);
        }
    });

    it("DecryptWithNullSecretThrows", () => {
        let value = "1234567890";
        let secret = encrypt.generateKey();
        let encrypted = encrypt.encryptString(value, secret);

        try {
            let nonresult = encrypt.decryptString(encrypted, null);
            assert.fail("did not throw error or exception");
        }
        catch (Error) {
            assert.ok(true);
        }

    });

    it("DecryptWithBadSecretThrows", () => {
        let value = "1234567890";
        let secret = encrypt.generateKey();
        let encrypted = encrypt.encryptString(value, secret);

        try {
            let nonresult = encrypt.decryptString(encrypted, "bad");
            assert.fail("did not throw error or exception");
        }
        catch (Error) {
            assert.ok(true);
        }

        try {
            let nonresult = encrypt.decryptString(encrypted, encrypt.generateKey());
            assert.fail("Decrypt with different key should throw");
        }
        catch (Error) {
            assert.ok(true);
        }

    });
});
