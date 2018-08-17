let assert = require('assert');
let config = require('../lib');

describe("EncryptionTests", () => {
    it("EncryptWithShortSecret", () => {
        let secret = "test";
        let value = "1234567890";
        let encrypted = config.encryptString(value, secret);
        assert.ok(value != encrypted, "encryption failed");

        let decrypted = config.decryptString(encrypted, secret);
        assert.ok(value === decrypted, "decryption failed");
    });

    it("EncryptWithLongSecret", () => {
        let secret = "this is a test of the emergency broadcasting system";
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
        let encrypted = config.encryptString(value, "test");

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
        let encrypted = config.encryptString(value, "test");

        try {
            let nonresult = config.decryptString(encrypted, "bad");
            assert.fail("did not throw error or exception");
        }
        catch (Error) {
            assert.ok(true);
        }

    });

    it("EncryptShouldMatchDotNetEncryption", () => {
        let value = "1234567890";
        let encrypted = config.encryptString(value, "good");
        assert.ok("5SUSNKAk/20DW/9cAEcL9A==" === encrypted, "the encryption settings should give same result that C# does");
    });

    it("EncryptWithIv", () => {
        let value = "1234567890";
        let secret = "test";
        let iv = "Yo";

        let encrypted = config.encryptString(value, secret, iv);
        assert.ok(encrypted != value, "encryption iv failed");

        let decrypted = config.decryptString(encrypted, secret, iv);
        assert.ok(decrypted === value, "decryption with iv failed");

        iv = "this is a really long iv and it should work too"; // test padding
        encrypted = config.encryptString(value, secret, iv);
        assert.ok(encrypted != value, "encryption long iv failed");

        decrypted = config.decryptString(encrypted, secret, iv);
        assert.ok(decrypted === value, "decryption with long iv failed");

        let encrypted1 =config.encryptString(value, secret, "one");
        let encrypted2 = config.encryptString(value, secret, "two");
        assert.ok(encrypted1 != encrypted2, "using same value with 2 different salts should give different results");
    });
});
