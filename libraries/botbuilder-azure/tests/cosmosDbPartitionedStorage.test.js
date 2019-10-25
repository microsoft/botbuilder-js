const assert = require('assert');
const { CosmosDbPartitionedStorage } = require('../lib');
const { AutoSaveStateMiddleware, ConversationState, MessageFactory, TestAdapter } = require('../../botbuilder-core');
const { Dialog, DialogSet, TextPrompt, WaterfallDialog } = require('../../botbuilder-dialogs');
const { CosmosClient } = require('@azure/cosmos');
const { MockMode, usingNock } = require('./mockHelper');
const nock = require('nock');
const fs = require('fs');
const https = require('https');

const mode = process.env.MOCK_MODE ? process.env.MOCK_MODE : MockMode.lockdown;

// Endpoint and Authkey for the CosmosDB Emulator running locally
const cosmosDbEndpoint = 'https://localhost:8081';
const authKey = 'C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==';
const databaseId = 'test-db';
const containerId = 'bot-storage';

const getSettings = () => {
    return {
        cosmosDbEndpoint,
        authKey,
        databaseId,
        containerId
    };
};

const storage = new CosmosDbPartitionedStorage(getSettings());

const noEmulatorMessage = 'This test requires CosmosDB Emulator! go to https://aka.ms/documentdb-emulator-docs to download and install.';
const emulatorPath = `C:/Program Files/Azure Cosmos DB Emulator/CosmosDB.Emulator.exe`;

// Disable certificate checking when running tests locally
if (cosmosDbEndpoint.includes('localhost:8081')) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    console.warn('WARNING: Disabling SSL Verification because we detected the emulator was being used');
}

const hasEmulator = fs.existsSync(emulatorPath);

const checkEmulator = () => {
    if (!hasEmulator) {
        console.warn(noEmulatorMessage);
    }
    return true;
};

// item to test the read and delete operations with partitionkey
let changes = {};
changes['001'] = {
    Location: 'ARG',
    MessageList: ['Hi', 'how are u']
};

// called before each test
const reset = async () => {
    nock.cleanAll();
    nock.enableNetConnect();
    if (mode !== MockMode.lockdown) {
        let settings = getSettings();

        let client = new CosmosClient({ endpoint: settings.cosmosDbEndpoint, key: settings.authKey});
        try {
            await client.database(settings.databaseId).delete();
        } catch (err) { }
        await client.databases.create({ id: databaseId });
    }
};

const options = {
    scope: getSettings().cosmosDbEndpoint
};

const testStorage = () => {

    it('should throw on invalid options', async function() {
        const { nockDone } = await usingNock(this.test, mode, options);

        // No options. Should throw.
        assert.throws(() => new CosmosDbPartitionedStorage(null), ReferenceError('CosmosDbPartitionedStorageOptions is required.'));
        
        // No endpoint. Should throw.
        const noEndpoint = getSettings();
        noEndpoint.cosmosDbEndpoint = null;
        assert.throws(() => new CosmosDbPartitionedStorage(noEndpoint), ReferenceError('cosmosDbEndpoint for CosmosDB is required.'));

        // No authKey. Should throw.
        const noAuthKey = getSettings();
        noAuthKey.authKey = null;
        assert.throws(() => new CosmosDbPartitionedStorage(noAuthKey), ReferenceError('authKey for CosmosDB is required.'));

        // No databaseId. Should throw.
        const noDatabaseId = getSettings();
        noDatabaseId.databaseId = null;
        assert.throws(() => new CosmosDbPartitionedStorage(noDatabaseId), ReferenceError('databaseId is for CosmosDB required.'));

        // No containerId. Should throw.
        const noContainerId = getSettings();
        noContainerId.containerId = null;
        assert.throws(() => new CosmosDbPartitionedStorage(noContainerId), ReferenceError('containerId for CosmosDB is required.'));

        // Passes CosmosClientOptions
        const settingsWithClientOptions = getSettings();
        settingsWithClientOptions.cosmosClientOptions = {
            agent: new https.Agent({ rejectUnauthorized: false }),
            connectionPolicy: { requestTimeout: 999 },
            userAgentSuffix: 'test', 
        };
        
        const client = new CosmosDbPartitionedStorage(settingsWithClientOptions);
        await client.initialize(); // Force client to go through initialization
        
        assert.strictEqual(client.client.clientContext.connectionPolicy.requestTimeout, 999);
        assert.strictEqual(client.client.clientContext.cosmosClientOptions.userAgentSuffix, 'test');

        return nockDone();
    });

    // NOTE: THESE TESTS REQUIRE THAT THE COSMOS DB EMULATOR IS INSTALLED AND STARTED !!!!!!!!!!!!!!!!!
    it('should create an object', async function() {
        if(checkEmulator()) {
            const { nockDone } = await usingNock(this.test, mode, options);
    
            const storeItems = {
                createPoco: { id: 1 },
                createPocoStoreItem: { id: 2 },
            };
    
            await storage.write(storeItems);
    
            const readStoreItems = await storage.read(Object.keys(storeItems));
    
            assert.strictEqual(storeItems.createPoco.id, readStoreItems.createPoco.id);
            assert.strictEqual(storeItems.createPocoStoreItem.id, readStoreItems.createPocoStoreItem.id);
            assert.notStrictEqual(readStoreItems.createPoco.eTag, null);
            assert.notStrictEqual(readStoreItems.createPocoStoreItem.eTag, null);
    
            return nockDone();
        }
    });

    // NOTE: THESE TESTS REQUIRE THAT THE COSMOS DB EMULATOR IS INSTALLED AND STARTED !!!!!!!!!!!!!!!!!
    it('should handle crazy keys', async function() {
        if(checkEmulator()) {
            const { nockDone } = await usingNock(this.test, mode, options);
    
            const key = `!@#$%^&*()~/\\><,.?';\"\`~`;
            const storeItem = { id: 1 };
            const storeItems = { [key]: storeItem };
    
            await storage.write(storeItems);
    
            const readStoreItems = await storage.read(Object.keys(storeItems));
    
            assert.notStrictEqual(readStoreItems[key], null);
            assert.strictEqual(readStoreItems[key].id, 1);
    
            return nockDone();
        }
    });

    // NOTE: THESE TESTS REQUIRE THAT THE COSMOS DB EMULATOR IS INSTALLED AND STARTED !!!!!!!!!!!!!!!!!
    it('should return empty dictionary when reading empty keys', async function() {
        if(checkEmulator()) {
            const { nockDone } = await usingNock(this.test, mode, options);
    
            const state = await storage.read([]);
            assert.deepStrictEqual(state, {});
    
            return nockDone();
        }
    });

    // NOTE: THESE TESTS REQUIRE THAT THE COSMOS DB EMULATOR IS INSTALLED AND STARTED !!!!!!!!!!!!!!!!!
    it('should throw when reading null keys', async function() {
        if(checkEmulator()) {
            const { nockDone } = await usingNock(this.test, mode, options);
    
            await assert.rejects(async () => await storage.read(null), ReferenceError(`Keys are required when reading.`));
    
            return nockDone();
        }
    });

    // NOTE: THESE TESTS REQUIRE THAT THE COSMOS DB EMULATOR IS INSTALLED AND STARTED !!!!!!!!!!!!!!!!!
    it('should throw when writing null keys', async function() {
        if(checkEmulator()) {
            const { nockDone } = await usingNock(this.test, mode, options);
    
            await assert.rejects(async () => await storage.write(null), ReferenceError(`Changes are required when writing.`));
    
            return nockDone();
        }
    });

    // NOTE: THESE TESTS REQUIRE THAT THE COSMOS DB EMULATOR IS INSTALLED AND STARTED !!!!!!!!!!!!!!!!!
    it('should not throw when writing no items', async function() {
        if(checkEmulator()) {
            const { nockDone } = await usingNock(this.test, mode, options);
    
            await assert.doesNotReject(async () => await storage.write([]));
    
            return nockDone();
        }
    });

    // NOTE: THESE TESTS REQUIRE THAT THE COSMOS DB EMULATOR IS INSTALLED AND STARTED !!!!!!!!!!!!!!!!!
    it('should update an object', async function() {
        if(checkEmulator()) {
            const { nockDone } = await usingNock(this.test, mode, options);
    
            const originalStoreItems = {
                pocoItem: { id: 1, count: 1 },
                pocoStoreItem: { id: 1, count: 1 },
            };
    
            // first write should work
            await storage.write(originalStoreItems);
    
            const loadedStoreItems = await storage.read(['pocoItem', 'pocoStoreItem']);
    
            const updatePocoItem = loadedStoreItems.pocoItem;
            delete updatePocoItem.eTag; // pocoItems don't have eTag
            const updatePocoStoreItem = loadedStoreItems.pocoStoreItem;
            assert.notStrictEqual(updatePocoStoreItem.eTag, null);
    
            // 2nd write should work
            updatePocoItem.count++;
            updatePocoStoreItem.count++;
    
            await storage.write(loadedStoreItems);
    
            const reloadedStoreItems = await storage.read(Object.keys(loadedStoreItems));
    
            const reloadedUpdatePocoItem = reloadedStoreItems.pocoItem;
            const reloadedUpdatePocoStoreItem = reloadedStoreItems.pocoStoreItem;
    
            assert.notStrictEqual(reloadedUpdatePocoItem.eTag, null);
            assert.notStrictEqual(updatePocoStoreItem.eTag, reloadedUpdatePocoStoreItem.eTag);
            assert.strictEqual(reloadedUpdatePocoItem.count, 2);
            assert.strictEqual(reloadedUpdatePocoStoreItem.count, 2);
    
            // Write with old eTag should succeed for non-storeitem
            try {
                updatePocoItem.count = 123;
    
                await storage.write({ pocoItem: updatePocoItem });
            } catch(err) {
                assert.fail('Should not throw exception on write with pocoItem');
            }
    
            // Write with old eTag should FAIL for storeItem
            try {
                updatePocoStoreItem.count = 123;
    
                await storage.write({ pocoStoreItem, updatePocoStoreItem });
                assert.fail('Should have thrown exception on write with store item because of old eTag');
            } catch(err) { }
    
            const reloadedStoreItems2 = await storage.read(['pocoItem', 'pocoStoreItem']);
    
            const reloadedPocoItem2 = reloadedStoreItems2.pocoItem;
            delete reloadedPocoItem2.eTag;
            const reloadedPocoStoreItem2 = reloadedStoreItems2.pocoStoreItem;
    
            assert.strictEqual(reloadedPocoItem2.count, 123);
            assert.strictEqual(reloadedPocoStoreItem2.count, 2);
    
            // write with wildcard etag should work
            reloadedPocoItem2.count = 100;
            reloadedPocoStoreItem2.count = 100;
            reloadedPocoStoreItem2.eTag = '*';
    
            const wildcardEtagdict = {
                pocoItem: reloadedPocoItem2,
                pocoStoreItem: reloadedPocoStoreItem2
            };
    
            await storage.write(wildcardEtagdict);
    
            const reloadedStoreItems3 = await storage.read(['pocoItem', 'pocoStoreItem']);
    
            assert.strictEqual(reloadedStoreItems3.pocoItem.count, 100);
            assert.strictEqual(reloadedStoreItems3.pocoStoreItem.count, 100);
    
            // Write with empty etag should not work
            try {
                const reloadedStoreItems4 = await storage.read(['pocoStoreItem']);
                const reloadedStoreItem4 = reloadedStoreItems4.pocoStoreItem;
    
                assert.notStrictEqual(reloadedStoreItem4, null);
    
                reloadedStoreItem4.eTag = '';
                const dict2 = { pocoStoreItem: reloadedStoreItem4 };
    
                await storage.write(dict2);
    
                assert.fail('Should have thrown exception on write with storeItem because of empty eTag');
            } catch (err) { }
    
            const finalStoreItems = await storage.read(['pocoItem', 'pocoStoreItem']);
            assert.strictEqual(finalStoreItems.pocoItem.count, 100);
            assert.strictEqual(finalStoreItems.pocoStoreItem.count, 100);
    
            return nockDone();
        }
    });

    // NOTE: THESE TESTS REQUIRE THAT THE COSMOS DB EMULATOR IS INSTALLED AND STARTED !!!!!!!!!!!!!!!!!
    it('should delete an object', async function() {
        if(checkEmulator()) {
            const { nockDone } = await usingNock(this.test, mode, options);
    
            const storeItems = {
                delete1: { id: 1, count: 1 }
            };
    
            await storage.write(storeItems);
    
            const readStoreItems = await storage.read(['delete1']);
    
            assert.notStrictEqual(readStoreItems.delete1.eTag, null);
            assert.strictEqual(readStoreItems.delete1.count, 1);
    
            await storage.delete(['delete1']);
    
            const reloadedStoreItems = await storage.read(['delete1']);
    
            assert.strictEqual(reloadedStoreItems.delete1, undefined);
    
            return nockDone();
        }
    });

    // NOTE: THESE TESTS REQUIRE THAT THE COSMOS DB EMULATOR IS INSTALLED AND STARTED !!!!!!!!!!!!!!!!!
    it('should not throw when deleting unknown object', async function() {
        if(checkEmulator()) {
            const { nockDone } = await usingNock(this.test, mode, options);

            await assert.doesNotReject(async () => {
                await storage.delete(['unknown_key']);
            });
    
            return nockDone();
        }
    });

    // NOTE: THESE TESTS REQUIRE THAT THE COSMOS DB EMULATOR IS INSTALLED AND STARTED !!!!!!!!!!!!!!!!!
    it('should correctly proceed through a waterfall dialog', async function() {
        if(checkEmulator()) {
            const { nockDone } = await usingNock(this.test, mode, options);

            const convoState = new ConversationState(storage);

            const dialogState = convoState.createProperty('dialogState');
            const dialogs = new DialogSet(dialogState);

            const adapter = new TestAdapter(async (turnContext) => {
                const dc = await dialogs.createContext(turnContext);

                await dc.continueDialog();
                if (!turnContext.responded) {
                    await dc.beginDialog('waterfallDialog');
                }
            })
                .use(new AutoSaveStateMiddleware(convoState));

            dialogs.add(new TextPrompt('textPrompt', async (promptContext) => {
                const result = promptContext.recognized.value;
                if (result.length > 3) {
                    const succeededMessage = MessageFactory.text(`You got it at the ${ promptContext.attemptCount }th try!`);
                    await promptContext.context.sendActivity(succeededMessage);
                    return true;
                }

                const reply = MessageFactory.text(`Please send a name that is longer than 3 characters. ${ promptContext.attemptCount }`);
                await promptContext.context.sendActivity(reply);
                return false;
            }));

            const steps = [
                async (stepContext) => {
                    assert.strictEqual(typeof(stepContext.activeDialog.state['stepIndex']), 'number');
                    await stepContext.context.sendActivity('step1');
                    return Dialog.EndOfTurn;
                },
                async (stepContext) => {
                    assert.strictEqual(typeof(stepContext.activeDialog.state['stepIndex']), 'number');
                    await stepContext.prompt('textPrompt', { prompt: MessageFactory.text('Please type your name.') });
                },
                async (stepContext) => {
                    assert.strictEqual(typeof(stepContext.activeDialog.state['stepIndex']), 'number');
                    await stepContext.context.sendActivity('step3');
                    return Dialog.EndOfTurn;
                },
            ];

            dialogs.add(new WaterfallDialog('waterfallDialog', steps));

            await adapter.send('hello')
                .assertReply('step1')
                .send('hello')
                .assertReply('Please type your name.')
                .send('hi')
                .assertReply('Please send a name that is longer than 3 characters. 1')
                .send('hi')
                .assertReply('Please send a name that is longer than 3 characters. 2')
                .send('hi')
                .assertReply('Please send a name that is longer than 3 characters. 3')
                .send('Kyle')
                .assertReply('You got it at the 4th try!')
                .assertReply('step3')
                .startTest();
    
            return nockDone();
        }
    });
};

describe('CosmosDbPartitionedStorage', function() {
    this.timeout(20000);
    before('cleanup', reset);
    testStorage();
    after('cleanup', reset);
});
