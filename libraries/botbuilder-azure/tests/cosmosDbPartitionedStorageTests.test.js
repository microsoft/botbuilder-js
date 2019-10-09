const assert = require('assert');
const { CosmosDbPartitionedStorage } = require('../lib');
const { CosmosClient } = require('@azure/cosmos');
const { MockMode, usingNock } = require('./mockHelper');
const nock = require('nock');
const fs = require('fs');

const mode = process.env.MOCK_MODE ? process.env.MOCK_MODE : MockMode.wild; // TODO: change this back to lockdown

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
        assert.fail(noEmulatorMessage);
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

const print = (o) => {
    return JSON.stringify(o, null, '  ');
};

const options = {
    scope: getSettings().serviceEndpoint
};

const testStorage = () => {

    it('should throw on invalid options', function() {
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

    });

    // NOTE: THESE TESTS REQUIRE THAT THE COSMOS DB EMULATOR IS INSTALLED AND STARTED !!!!!!!!!!!!!!!!!
    it('should create an object', async function() {
        if(checkEmulator()) {
            const { nockDone } = usingNock(this.test, mode, options);
    
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
    
            nockDone;
        }
    });

    // NOTE: THESE TESTS REQUIRE THAT THE COSMOS DB EMULATOR IS INSTALLED AND STARTED !!!!!!!!!!!!!!!!!
    it('should handle crazy keys', async function() {
        if(checkEmulator()) {
            const { nockDone } = usingNock(this.test, mode, options);
    
            const key = `!@#$%^&*()~/\\><,.?';\"\`~`;
            const storeItem = { id: 1 };
            const storeItems = { [key]: storeItem };
    
            await storage.write(storeItems);
    
            const readStoreItems = await storage.read(Object.keys(storeItems));
    
            assert.notStrictEqual(readStoreItems[key], null);
            assert.strictEqual(readStoreItems[key].id, 1);
    
            nockDone;
        }
    });

    // NOTE: THESE TESTS REQUIRE THAT THE COSMOS DB EMULATOR IS INSTALLED AND STARTED !!!!!!!!!!!!!!!!!
    it('should update an object', async function() {
        if(checkEmulator()) {
            const { nockDone } = usingNock(this.test, mode, options);
    
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
    
            nockDone;
        }
    });

    // NOTE: THESE TESTS REQUIRE THAT THE COSMOS DB EMULATOR IS INSTALLED AND STARTED !!!!!!!!!!!!!!!!!
    it('should delete an object', async function() {
        this.timeout(99*99*99);
        if(checkEmulator()) {
            const { nockDone } = usingNock(this.test, mode, options);
    
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
    
            nockDone;
        }
    });
};

// TODO: Add additional tests

describe('CosmosDbPartitionedStorage', function() {
    this.timeout(20000);
    before('cleanup', reset);
    testStorage();
    after('cleanup', reset);
});