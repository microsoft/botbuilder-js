let assert = require('assert');
let bf = require('../lib');
let fs = require('fs');
let path = require('path');

// do not save over testbot
const testBotPath = require.resolve("./test.bot");
const legacyBotPath = require.resolve("./legacy.bot");
const saveBotPath = testBotPath.replace("test.bot", "save.bot");

describe("LoadAndSaveTests", () => {
    it("DeserializeBotFile", async () => {
        var config = await bf.BotConfiguration.load(testBotPath);

        assert.ok("test" == config.name);
        assert.ok("test description" == config.description);
        assert.ok("" == config.secretKey);
        assert.ok(9 == config.services.length);
        assert.equal(config.getPath(), testBotPath, "bot doesn't remember where it was loaded from");
    });

    it("LoadFromFolder", async () => {
        var config = await bf.BotConfiguration.loadBotFromFolder(path.dirname(testBotPath));
        assert.equal(config.name, "a", "loaded wrong file");

        var config2 = bf.BotConfiguration.loadBotFromFolderSync(path.dirname(testBotPath));
        assert.deepEqual(config, config2, "loaded wrong file");
    });

    it("LoadAndSaveUnencryptedBotFile", async () => {
        var config = await bf.BotConfiguration.load(testBotPath);
        await config.saveAs(saveBotPath);

        var config2 = await bf.BotConfiguration.load(saveBotPath);
        fs.unlinkSync(saveBotPath);
        delete config.internal;
        delete config2.internal;
        assert.deepEqual(config, config2, "configs should be same");
    });

    it("LoadAndSaveBotFileSync", () => {
        var secret = bf.BotConfiguration.generateKey();
        var config = bf.BotConfiguration.loadSync(testBotPath);

        // saveAsSync
        config.saveAsSync(saveBotPath, secret);

        var config2 = bf.BotConfiguration.loadSync(saveBotPath, secret);
        fs.unlinkSync(saveBotPath);
        assert.deepEqual(config.services, config2.services, "configs should be same");

        // saveSync
        config2.name = 'saveSync';
        config2.saveSync(secret);
        var config3 = bf.BotConfiguration.loadSync(saveBotPath, secret);
        fs.unlinkSync(saveBotPath);
        assert.equal(config3.name, config2.name, "didn't save");
    });

    it("CantLoadWithoutSecret", async () => {
        let secret = bf.BotConfiguration.generateKey();
        var config = await bf.BotConfiguration.load(testBotPath);
        await config.saveAs(saveBotPath, secret);

        try {
            await bf.BotConfiguration.load(saveBotPath);
            assert.fail("Load should have thrown due to no secret");
        }
        catch (Error) { }
    });

    if ("CantSaveWithoutSecret", async () => {
        let secret = bf.BotConfiguration.generateKey();
        var config = await bf.BotConfiguration.load(testBotPath);
        await config.saveAs(saveBotPath, secret);

        var config2 = await bf.BotConfiguration.load(saveBotPath, secret);
        try {
            await config2.saveAs(saveBotPath);
            assert.fail("Save() should have thrown due to no secret");
        }
        catch (Error) {

        }
        config2.ClearSecret();
        await config2.saveAs(saveBotPath, secret);
    });

    it("LoadAndSaveEncrypted", async () => {
        let secret = bf.BotConfiguration.generateKey();
        var config = await bf.BotConfiguration.load(testBotPath);
        assert.ok(config.secretKey === "", "There should be no secretKey");

        // save with secret
        await config.saveAs(saveBotPath, secret);
        assert.ok(config.secretKey.length > 0, "There should be a secretKey");

        // load with secret
        var config2 = await bf.BotConfiguration.load(saveBotPath, secret);
        assert.ok(config2.secretKey.length > 0, "There should be a secretKey");
        assert.ok(config.secretKey === config2.secretKey, "SecretKeys should be the same");

        // make sure these were decrypted
        for (let i = 0; i < config.services.length; i++) {
            assert.deepEqual(config.services[i], config2.services[i], "service definition is not the same");

            switch (config.services[i].type) {
                case bf.ServiceTypes.Bot:
                    break;

                case bf.ServiceTypes.AppInsights:
                    {
                        var appInsights = config2.services[i];
                        assert.ok(appInsights.instrumentationKey.includes('0000000'), "failed to decrypt instrumentationKey");
                        assert.equal(appInsights.applicationId, "00000000-0000-0000-0000-000000000007", "failed to decrypt applicationId");
                        assert.equal(appInsights.apiKeys.key1, "testKey1", "failed to decrypt key1");
                        assert.equal(appInsights.apiKeys.key2, "testKey2", "failed to decrypt key2");
                    }
                    break;

                case bf.ServiceTypes.BlobStorage:
                    {
                        var storage = config2.services[i];
                        assert.ok(storage.connectionString.includes('UseDevelopmentStorage'), "failed to decrypt connectionString");
                        assert.equal(storage.container, 'testContainer', "failed to decrypt container");
                    }
                    break;

                case bf.ServiceTypes.CosmosDB:
                    {
                        var storage = config2.services[i];
                        assert.ok(storage.connectionString.includes('UseDevelopmentStorage'), "failed to decrypt connectionString");
                        assert.equal(storage.database, 'testDatabase', "failed to decrypt database");
                        assert.equal(storage.collection, 'testCollection', "failed to decrypt collection");
                    }
                    break;

                case bf.ServiceTypes.Dispatch:
                    {
                        var dispatch = config2.services[i];
                        assert.ok(dispatch.authoringKey.includes("0000"), "failed to decrypt authoringkey");
                        assert.ok(dispatch.subscriptionKey.includes("0000"), "failed to decrypt subscriptionKey");
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
                        assert.ok(luis.authoringKey.includes("0000"), "failed to decrypt authoringkey");
                        assert.ok(luis.subscriptionKey.includes("0000"), "failed to decrypt subscriptionKey");
                    }
                    break;

                case bf.ServiceTypes.QnA:
                    {
                        var qna = config2.services[i];
                        assert.ok(qna.kbId.includes("0000"), "kbId should not be changed");
                        assert.ok(qna.endpointKey.includes("0000"), "failed to decrypt endpointKey");
                        assert.ok(qna.subscriptionKey.includes("0000"), "failed to decrypt SubscriptionKey");
                    }
                    break;

                case bf.ServiceTypes.Generic:
                    {
                        var generic = config2.services[i];
                        assert.equal(generic.url, 'https://bing.com', "url should not change");
                        assert.equal(generic.configuration.key1, 'testKey1', "failed to decrypt key1");
                        assert.equal(generic.configuration.key2, 'testKey2', "failed to decrypt key2");
                    }
                    break;

                default:
                    throw new Error(`Unknown service type ${config.services[i].type}`);
            }
        }
        fs.unlinkSync(saveBotPath);

        // encrypt in memory copy
        config2.encrypt(secret);

        // make sure these are all encrypted
        for (let i = 0; i < config.services.length; i++) {
            switch (config.services[i].type) {

                case bf.ServiceTypes.Bot:
                    assert.deepEqual(config.services[i], config2.services[i]);
                    break;

                case bf.ServiceTypes.AppInsights:
                    {
                        var appInsights = config2.services[i];
                        assert.ok(!appInsights.instrumentationKey.includes('0000000'), "failed to encrypt instrumentationKey");
                        assert.equal(appInsights.applicationId, "00000000-0000-0000-0000-000000000007", "should not encrypt applicationId");
                        assert.notEqual(appInsights.apiKeys.key1, "testKey1", "failed to encrypt key1");
                        assert.notEqual(appInsights.apiKeys.key2, "testKey2", "failed to encrypt key2");
                    }
                    break;

                case bf.ServiceTypes.BlobStorage:
                    {
                        var storage = config2.services[i];
                        assert.ok(!storage.connectionString.includes('UseDevelopmentStorage'), "failed to encrypt connectionString");
                        assert.equal(storage.container, "testContainer", "should not have encrypted container");
                    }
                    break;

                case bf.ServiceTypes.CosmosDB:
                    {
                        var storage = config2.services[i];
                        assert.ok(!storage.connectionString.includes('UseDevelopmentStorage'), "failed to encrypt connectionString");
                        assert.equal(storage.database, "testDatabase", "should not have encrypted database");
                        assert.equal(storage.collection, "testCollection", "should not have encrypted collection");
                    }
                    break;


                case bf.ServiceTypes.Dispatch:
                    {
                        assert.notDeepEqual(config.services[i], config2.services[i]);
                        var dispatch = config2.services[i];
                        assert.ok(!dispatch.authoringKey.includes("0000"), "failed to encrypt authoringkey");
                        assert.ok(!dispatch.subscriptionKey.includes("0000"), "failed to encrypt subscriptionKey");
                    }
                    break;

                case bf.ServiceTypes.Endpoint:
                    {
                        assert.notDeepEqual(config.services[i], config2.services[i]);
                        var endpoint = config2.services[i];
                        assert.ok(endpoint.appId.includes("0000"), "appId should not be changed");
                        assert.ok(!endpoint.appPassword.includes("0000"), "failed to encrypt appPassword");
                    }
                    break;

                case bf.ServiceTypes.File:
                    assert.deepEqual(config.services[i], config2.services[i]);
                    break;

                case bf.ServiceTypes.Luis:
                    {
                        assert.notDeepEqual(config.services[i], config2.services[i]);
                        var luis = config2.services[i];
                        assert.ok(!luis.authoringKey.includes("0000"), "failed to encrypt authoringkey");
                        assert.ok(!luis.subscriptionKey.includes("0000"), "failed to encrypt subscriptionKey");
                    }
                    break;

                case bf.ServiceTypes.QnA:
                    {
                        assert.notDeepEqual(config.services[i], config2.services[i]);
                        var qna = config2.services[i];
                        assert.ok(qna.kbId.includes("0000"), "kbId should not be changed");
                        assert.ok(!qna.endpointKey.includes("0000"), "failed to encrypt endpointKey");
                        assert.ok(!qna.subscriptionKey.includes("0000"), "failed to encrypt SubscriptionKey");
                    }
                    break;

                case bf.ServiceTypes.Generic:
                    {
                        var generic = config2.services[i];
                        assert.equal(generic.url, 'https://bing.com', "url should not change");
                        assert.notEqual(generic.configuration.key1, 'testKey1', "failed to encrypt key1");
                        assert.notEqual(generic.configuration.key2, 'testKey2', "failed to encrypt key1");
                    }
                    break;

                default:
                    throw new Error(`Unknown service type ${config.services[i].type}`);
            }
        }
    });

    it("LegacyEncryption", async () => {
        var config = await bf.BotConfiguration.load(legacyBotPath, "password");
        assert.equal(config.services[0].appPassword, "xyzpdq", "value should be unencrypted");

        let secret = bf.BotConfiguration.generateKey();
        await config.saveAs(saveBotPath, secret);
        var config = await bf.BotConfiguration.load(saveBotPath, secret);
        fs.unlinkSync(saveBotPath);
    });

});

