const assert = require('assert');
const { CosmosDbStorage } = require('../');
const { StorageBaseTests } = require('../../botbuilder-core/tests/storageBaseTests');
const { DocumentClient, UriFactory } = require('documentdb');
const { MockMode, usingNock } = require('./mockHelper');
const nock = require('nock');
const fs = require('fs');

/**
 * @param mode controls the nock mode used for the tests. Available options found in ./mockHelper.js.
 */
const mode = process.env.MOCK_MODE ? process.env.MOCK_MODE : MockMode.lockdown;

const emulatorPath = 'C:/Program Files/Azure Cosmos DB Emulator/CosmosDB.Emulator.exe';

// Endpoint and authKey for the CosmosDB Emulator running locally
const getSettings = (partitionKey=undefined) => ({
    serviceEndpoint: 'https://localhost:8081',
    authKey: 'C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==',
    databaseId: 'test-db',
    collectionId: 'bot-storage',
    partitionKey
});

const checkEmulator = () => {
    if (!fs.existsSync(emulatorPath)) {
        console.warn('This test requires CosmosDB Emulator! go to https://aka.ms/documentdb-emulator-docs to download and install.');
    }
    return true;
};

// called before each test
const reset = (done) => {
    nock.cleanAll();
    nock.enableNetConnect();
    if (mode !== MockMode.lockdown) {
        let settings = getSettings();
        let client = new DocumentClient(settings.serviceEndpoint, { masterKey: settings.authKey });
        client.deleteDatabase(UriFactory.createDatabaseUri(settings.databaseId), (err, response) => done());
    } else {
        done();
    }
};

const policyConfigurator = (policy) => policy.DisableSSLVerification = true;

const options = {
    scope: getSettings().serviceEndpoint
};

const storage = new CosmosDbStorage(getSettings(), policyConfigurator);
const partitionKey = 'ARG';
const partitionedStorage = new CosmosDbStorage(getSettings(partitionKey), policyConfigurator);

// item to test the read and delete operations with partitionkey
let changes = {};
changes['001'] = {
    Location: partitionKey,
    MessageList: ['Hi', 'how are u']
}

describe('CosmosDbStorage - Constructor Tests', function() {
    it('missing settings should throw', function() {
        assert.throws(() => new CosmosDbStorage(), Error, 'constructor should have thrown error about missing settings.');
    });

    it('missing settings endpoint should be thrown - null value', function () {
        let testSettings = {
            serviceEndpoint: null,
            authKey: 'testKey',
            databaseId: 'testDataBaseID',
            collectionId: 'testCollectionID'
        };

        assert.throws(() => new CosmosDbStorage(testSettings), Error, 'constructor should have thrown error about missing service Endpoint.')
    });

    it('missing settings endpoint should be thrown - empty value', function () {
        let testSettings = {
            serviceEndpoint: '',
            authKey: 'testKey',
            databaseId: 'testDataBaseID',
            collectionId: 'testCollectionID'
        };

        assert.throws(() => new CosmosDbStorage(testSettings), Error, 'constructor should have thrown error about missing service Endpoint.')
    });

    it('missing settings endpoint should be thrown - white spaces', function () {
        let testSettings = {
            serviceEndpoint: '   ',
            authKey: 'testKey',
            databaseId: 'testDataBaseID',
            collectionId: 'testCollectionID'
        };

        assert.throws(() => new CosmosDbStorage(testSettings), Error, 'constructor should have thrown error about missing service Endpoint.')
    });

    it('missing settings authKey should be thrown - null value', function () {
        let testSettings = {
            serviceEndpoint: 'testEndpoint',
            authKey: null,
            databaseId: 'testDataBaseID',
            collectionId: 'testCollectionID'
        };

        assert.throws(() => new CosmosDbStorage(testSettings), Error, 'constructor should have thrown error about missing authKey.')
    });

    it('missing settings authKey should be thrown - empty value', function () {
        let testSettings = {
            serviceEndpoint: 'testEndpoint',
            authKey: '',
            databaseId: 'testDataBaseID',
            collectionId: 'testCollectionID'
        };

        assert.throws(() => new CosmosDbStorage(testSettings), Error, 'constructor should have thrown error about missing authKey.')
    });

    it('missing settings authKey should be thrown - white spaces', function () {
        let testSettings = {
            serviceEndpoint: 'testEndpoint',
            authKey: '   ',
            databaseId: 'testDataBaseID',
            collectionId: 'testCollectionID'
        };

        assert.throws(() => new CosmosDbStorage(testSettings), Error, 'constructor should have thrown error about missing authKey.')
    });

    it('missing settings databaseId should be thrown - null value', function () {
        let testSettings = {
            serviceEndpoint: 'testEndpoint',
            authKey: 'testKey',
            databaseId: null,
            collectionId: 'testCollectionID'
        };

        assert.throws(() => new CosmosDbStorage(testSettings), Error, 'constructor should have thrown error about missing database ID.')
    });

    it('missing settings databaseId should be thrown - empty value', function () {
        let testSettings = {
            serviceEndpoint: 'testEndpoint',
            authKey: 'testKey',
            databaseId: '',
            collectionId: 'testCollectionID'
        };

        assert.throws(() => new CosmosDbStorage(testSettings), Error, 'constructor should have thrown error about missing database ID.')
    });

    it('missing settings databaseId should be thrown - white spaces', function () {
        let testSettings = {
            serviceEndpoint: 'testEndpoint',
            authKey: 'testKey',
            databaseId: '    ',
            collectionId: 'testCollectionID'
        };

        assert.throws(() => new CosmosDbStorage(testSettings), Error, 'constructor should have thrown error about missing database ID.')
    });

    it('missing settings collectionId should be thrown - null value', function () {
        let testSettings = {
            serviceEndpoint: 'testEndpoint',
            authKey: 'testKey',
            databaseId: 'testDataBaseID',
            collectionId: null
        };

        assert.throws(() => new CosmosDbStorage(testSettings), Error, 'constructor should have thrown error about missing collection ID.')
    });

    it('missing settings collectionId should be thrown - empty value', function () {
        let testSettings = {
            serviceEndpoint: 'testEndpoint',
            authKey: 'testKey',
            databaseId: 'testDataBaseID',
            collectionId: ''
        };

        assert.throws(() => new CosmosDbStorage(testSettings), Error, 'constructor should have thrown error about missing collection ID.')
    });

    it('missing settings collectionId should be thrown - white spaces', function () {
        let testSettings = {
            serviceEndpoint: 'testEndpoint',
            authKey: 'testKey',
            databaseId: 'testDataBaseID',
            collectionId: '    '
        };

        assert.throws(() => new CosmosDbStorage(testSettings), Error, 'constructor should have thrown error about missing collection ID.')
    });
});

describe('CosmosDbStorage - Base Storage Tests', function() {
    before('cleanup', reset);
    after('cleanup', reset);

    it('return empty object when reading unknown key', async function() {
        checkEmulator();
        const { nockDone } = await usingNock(this.test, mode, options);

        const testRan = await StorageBaseTests.returnEmptyObjectWhenReadingUnknownKey(storage);
        
        assert.strictEqual(testRan, true);

        return nockDone();
    });

    it('throws when reading null keys', async function() {
        checkEmulator();
        const { nockDone } = await usingNock(this.test, mode, options);

        const testRan = await StorageBaseTests.handleNullKeysWhenReading(storage);

        assert.strictEqual(testRan, true);
        return nockDone();
    });

    it('throws when writing null keys', async function() {
        checkEmulator();
        const { nockDone } = await usingNock(this.test, mode, options);

        const testRan = await StorageBaseTests.handleNullKeysWhenWriting(storage);
        
        assert.strictEqual(testRan, true);
        return nockDone();
    });

    it('does not throw when writing no items', async function() {
        checkEmulator();
        const { nockDone } = await usingNock(this.test, mode, options);

        const testRan = await StorageBaseTests.doesNotThrowWhenWritingNoItems(storage);
        
        assert.strictEqual(testRan, true);
        return nockDone();
    });

    it('create an object', async function() {
        checkEmulator();
        const { nockDone } = await usingNock(this.test, mode, options);

        const testRan = await StorageBaseTests.createObject(storage);

        assert.strictEqual(testRan, true);
        return nockDone();
    });

    it('handle crazy keys', async function() {
        checkEmulator();
        const { nockDone } = await usingNock(this.test, mode, options);

        const testRan = await StorageBaseTests.handleCrazyKeys(storage);

        assert.strictEqual(testRan, true);
        return nockDone();
    });

    it('update an object', async function() {
        checkEmulator();
        const { nockDone } = await usingNock(this.test, mode, options);

        const testRan = await StorageBaseTests.updateObject(storage);

        assert.strictEqual(testRan, true);
        return nockDone();
    });

    it('delete an object', async function() {
        checkEmulator();
        const { nockDone } = await usingNock(this.test, mode, options);

        const testRan = await StorageBaseTests.deleteObject(storage);

        assert.strictEqual(testRan, true);
        return nockDone();
    });

    it('does not throw when deleting an unknown object', async function() {
        checkEmulator();
        const { nockDone } = await usingNock(this.test, mode, options);

        const testRan = await StorageBaseTests.deleteUnknownObject(storage);

        assert.strictEqual(testRan, true);
        return nockDone();
    });

    it('performs batch operations', async function() {
        checkEmulator();
        const { nockDone } = await usingNock(this.test, mode, options);

        const testRan = await StorageBaseTests.performBatchOperations(storage);

        assert.strictEqual(testRan, true);
        return nockDone();
    });

    it('proceeds through a waterfall dialog', async function() {
        checkEmulator();
        const { nockDone } = await usingNock(this.test, mode, options);

        const testRan = await StorageBaseTests.proceedsThroughWaterfall(storage);

        assert.strictEqual(testRan, true);
        return nockDone();
    });

    it('should call connectionPolicyConfigurator', function() {
        let policy = null;
        new CosmosDbStorage(getSettings(), (policyInstance) => policy = policyInstance);

        assert.notStrictEqual(policy, null);
    });
});

// PartitionKeys are deprecated. Tests are here to ensure backwards compatibility of changes
describe('CosmosDbStorage - PartitionKey Tests', function() {
    before('cleanup', reset);
    after('cleanup', reset);

    it('create and read an object with partitionKey', async function() {
        checkEmulator();
        const { nockDone } = await usingNock(this.test, mode, options);

        await storage.write(changes);
        const result = await storage.read(['001']);

        assert.ok(result['001']);
        return nockDone();
    });

    it('update an object with partitionKey', async function() {
        checkEmulator();
        const { nockDone } = await usingNock(this.test, mode, options);

        await storage.write({ keyUpdate: { count: 1 }, Location: partitionKey });
        const result = await storage.read(['keyUpdate']);

        assert.strictEqual(result.keyUpdate.count, 1);

        result.keyUpdate.count = 2;
        await storage.write(result);
        const updated = await storage.read(['keyUpdate']);

        assert.strictEqual(updated.keyUpdate.count, 2);
        assert.notStrictEqual(updated.keyUpdate.eTag, result.keyUpdate.eTag);

        return nockDone();
    });

    it('delete an object with partitionKey', async function() {
        checkEmulator();
        const { nockDone } = await usingNock(this.test, mode, options);

        await storage.write(changes);
        let result = await storage.read(['001']);
        assert.ok(result['001']);

        await storage.delete(['001']);
        result = await storage.read(['001']);

        assert.strictEqual(Object.keys(result).length, 0);
        return nockDone();
    });
});

// These tests use the same Cosmos DB configuration, but are not expected to call the Cosmos DB Emulator.
describe('CosmosDbStorage - Offline tests', function() {
    it('should return empty object when null is passed in to read()', async function() {
        const storage = new CosmosDbStorage(getSettings(), policyConfigurator);
        const storeItems = await storage.read(null);
        assert.deepEqual(storeItems, {}, `did not receive empty object, instead received ${JSON.stringify(storeItems)}`);
    });

    it('should return empty object when no keys are passed in to read()', async function() {
        const storage = new CosmosDbStorage(getSettings(), policyConfigurator);
        const storeItems = await storage.read([]);
        assert.deepEqual(storeItems, {}, `did not receive empty object, instead received ${JSON.stringify(storeItems)}`);
    });

    it('should not blow up when no changes are passed in to write()', async function() {
        const storage = new CosmosDbStorage(getSettings(), policyConfigurator);
        await assert.doesNotReject(async () => await storage.write({}));
    });

    it('should not blow up when null is passed in to write()', async function() {
        const storage = new CosmosDbStorage(getSettings(), policyConfigurator);
        await assert.doesNotReject(async () => await storage.write(null));
    });

    it('should not blow up when no keys are passed in to delete()', async function() {
        const storage = new CosmosDbStorage(getSettings(), policyConfigurator);
        await assert.doesNotReject(async () => await storage.delete([]));
    });

    it('should not blow up when null is passed in to delete()', async function() {
        const storage = new CosmosDbStorage(getSettings(), policyConfigurator);
        await assert.doesNotReject(async () => await storage.delete(null));
    });
});