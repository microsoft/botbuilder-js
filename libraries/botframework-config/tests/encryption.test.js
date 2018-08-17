let assert = require('assert');
let config = require('../lib');

describe("EncryptionTests", () => {
    it("EncryptDecrypt", () => {
        let secret = "lgCbJPXnfOlatjbBDKMbh0ie6bc8PD/cjqA/2tPgMS0=";
        let value = "1234567890";
        let encrypted = config.encryptString(value, secret);
        assert.ok(value != encrypted, "encryption failed");

        let decrypted = config.decryptString(encrypted, secret);
        assert.ok(value === decrypted, "decryption failed");
    });

    it("GenerateKeyWorks", () => {
        let secret = config.generateKey();
        let value = "1234567890";
        let encrypted = config.encryptString(value, secret);
        assert.ok(value != encrypted, "encryption failed");

        let decrypted = config.decryptString(encrypted, secret);
        assert.ok(value === decrypted, "decryption failed");
    });

    it("EncryptWithNullSecretThrows", () => {
        let value = "1234567890";
        try {
            config.encryptString(value);
            assert.fail("did not throw error or exception");
        }
        catch (Error) {
            assert.ok(true);
        }
    });

    it("DecryptWithNullSecretThrows", () => {
        let value = "1234567890";
        let secret = config.generateKey();
        let encrypted = config.encryptString(value, secret);

        try {
            let nonresult = config.decryptString(encrypted, null);
            assert.fail("did not throw error or exception");
        }
        catch (Error) {
            assert.ok(true);
        }

    });

    it("DecryptWithBadSecretThrows", () => {
        let value = "1234567890";
        let secret = config.generateKey();
        let encrypted = config.encryptString(value, secret);

        try {
            let nonresult = config.decryptString(encrypted, "bad");
            assert.fail("did not throw error or exception");
        }
        catch (Error) {
            assert.ok(true);
        }

        try {
            let nonresult = config.decryptString(encrypted, config.generateKey());
            assert.fail("Decrypt with different key should throw");
        }
        catch (Error) {
            assert.ok(true);
        }

    });
});
