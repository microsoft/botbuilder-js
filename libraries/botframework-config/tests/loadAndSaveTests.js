let assert = require('assert');
let bf = require('../lib');
let fs = require('fs');

// do not save over testbot
const testBotPath = "tests/test.bot";
const saveBotPath = "tests/save.bot";

describe("LoadAndSaveTests", () => {
    it("SerializeBotFile", async () => {
        var config = await bf.BotConfiguration.load(testBotPath);

        assert.ok("test" == config.name);
        assert.ok("test description" == config.description);
        assert.ok("" == config.secretKey);
        assert.ok(6 == config.services.length);
    });

    it("LoadAndSaveUnencryptedBotFile", async () => {
        var config = await bf.BotConfiguration.load(testBotPath);
        await config.save(saveBotPath);

        var config2 = await bf.BotConfiguration.load(saveBotPath);
        fs.unlinkSync(saveBotPath);
        delete config.leternal;
        delete config2.leternal;
        assert.ok(JSON.stringify(config) === JSON.stringify(config2), "configs should be same");
    });

    it("LoadAndSaveEncrypted", async () => {
        let secret = "test";
        var config = await bf.BotConfiguration.load(testBotPath);
        assert.ok(config.secretKey === "", "There should be no secretKey");

        // save with secret
        await config.save(saveBotPath, secret);
        assert.ok(config.secretKey.length > 0, "There should be a secretKey");

        // load with secret
        var config2 = await bf.BotConfiguration.load(saveBotPath, secret);
        assert.ok(config2.secretKey.length > 0, "There should be a secretKey");
        assert.ok(config.secretKey === config2.secretKey, "SecretKeys should be the same");

        // make sure these were decrypted
        for (let i = 0; i < config.services.length; i++) {
            assert.deepEqual(config.services[i], config2.services[i], "service definition is not the same");

            switch (config.services[i].type) {
                case bf.ServiceTypes.AzureBotService:
                    break;

                case bf.ServiceTypes.Dispatch:
                    {
                        var dispatch = config2.services[i];
                        assert.ok(dispatch.authoringKey("test"), "failed to decrypt authoringkey");
                        assert.ok(dispatch.subscriptionKey.includes("test"), "failed to decrypt subscriptionKey");
                    }
                    break;

                case bf.ServiceTypes.Endpoint:
                    {
                        var endpoint = config2.services[i];
                        assert.ok(endpoint.appPassword.includes("test"), "failed to decrypt appPassword");
                    }
                    break;

                case bf.ServiceTypes.File:
                    break;

                case bf.ServiceTypes.Luis:
                    {
                        var luis = config2.services[i];
                        assert.ok(luis.authoringKey.includes("test"), "failed to decrypt authoringkey");
                        assert.ok(luis.subscriptionKey.includes("test"), "failed to decrypt subscriptionKey");
                    }
                    break;

                case bf.ServiceTypes.QnA:
                    {
                        var qna = config2.services[i];
                        assert.ok(qna.kbId.includes("test"), "kbId should not be changed");
                        assert.ok(qna.endpointKey.includes("test"), "failed to decrypt endpointKey");
                        assert.ok(qna.subscriptionKey.includes("test"), "failed to decrypt SubscriptionKey");
                    }
                    break;
                default:
                    throw new Error(`Unknown service type ${config.services[i].type}`);
            }
        }
        fs.unlinkSync(saveBotPath);

        // encrypt in memory copy
        config2.encrypt(secret);

        // make sure these are all true
        for (let i = 0; i < config.services.length; i++) {
            switch (config.services[i].type) {
                case bf.ServiceTypes.AzureBotService:
                    assert.deepEqual(config.services[i], config2.services[i]);
                    break;

                case bf.ServiceTypes.Dispatch:
                    {
                        assert.notDeepEqual(config.services[i], config2.services[i]);
                        var dispatch = config2.services[i];
                        assert.ok(!dispatch.authoringKey.includes("test"), "failed to encrypt authoringkey");
                        assert.ok(!dispatch.subscriptionKey.includes("test"), "failed to encrypt subscriptionKey");
                    }
                    break;

                case bf.ServiceTypes.Endpoint:
                    {
                        assert.notDeepEqual(config.services[i], config2.services[i]);
                        var endpoint = config2.services[i];
                        assert.ok(endpoint.appId.includes("test"), "appId should not be changed");
                        assert.ok(!endpoint.appPassword.includes("test"), "failed to encrypt appPassword");
                    }
                    break;

                case bf.ServiceTypes.File:
                    assert.deepEqual(config.services[i], config2.services[i]);
                    break;

                case bf.ServiceTypes.Luis:
                    {
                        assert.notDeepEqual(config.services[i], config2.services[i]);
                        var luis = config2.services[i];
                        assert.ok(!luis.authoringKey.includes("test"), "failed to encrypt authoringkey");
                        assert.ok(!luis.subscriptionKey.includes("test"), "failed to encrypt subscriptionKey");
                    }
                    break;

                case bf.ServiceTypes.QnA:
                    {
                        assert.notDeepEqual(config.services[i], config2.services[i]);
                        var qna = config2.services[i];
                        assert.ok(qna.kbId.includes("test"), "kbId should not be changed");
                        assert.ok(!qna.endpointKey.includes("test"), "failed to encrypt endpointKey");
                        assert.ok(!qna.subscriptionKey.includes("test"), "failed to encrypt SubscriptionKey");
                    }
                    break;

                default:
                    throw new Error(`Unknown service type ${config.services[i].type}`);
            }
        }
    });
});

