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
const emulatorPath = `%ProgramFiles%/Azure Cosmos DB Emulator/CosmosDB.Emulator.exe`;

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

    it('should create an object', async function() {
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
    });

    it('should handle crazy keys', async function() {
        const { nockDone } = usingNock(this.test, mode, options);

        const key = `!@#$%^&*()~/\\><,.?';\"\`~`;
        const storeItem = { id: 1 };
        const storeItems = { [key]: storeItem };

        await storage.write(storeItems);

        const readStoreItems = await storage.read(Object.keys(storeItems));

        assert.notStrictEqual(readStoreItems[key], null);
        assert.strictEqual(readStoreItems[key].id, 1);

        nockDone;
    });

    it('should update an object', async function() {
        const { nockDone } = usingNock(this.test, mode, options);

        const originalStoreItems = {
            pocoItem: { id: 1, count: 1 },
            pocoStoreItem: { id: 1, count: 1 },
        };

        // first write should work
        await storage.write(originalStoreItems);

        const loadedStoreItems = await storage.read([ 'pocoItem', 'pocoStoreItem' ]);

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

        const reloadedStoreItems2 = await storage.read([ 'pocoItem', 'pocoStoreItem' ]);

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

        const reloadedStoreItems3 = await storage.read([ 'pocoItem', 'pocoStoreItem' ]);

        assert.strictEqual(reloadedStoreItems3.pocoItem.count, 100);
        assert.strictEqual(reloadedStoreItems3.pocoStoreItem.count, 100);

        // Write with empty etag should not work
        try {
            const reloadedStoreItems4 = await storage.read([ 'pocoStoreItem' ]);
            const reloadedStoreItem4 = reloadedStoreItems4.pocoStoreItem;

            assert.notStrictEqual(reloadedStoreItem4, null);

            reloadedStoreItem4.eTag = '';
            const dict2 = { pocoStoreItem: reloadedStoreItem4 };

            await storage.write(dict2);

            assert.fail('Should have thrown exception on write with storeItem because of empty eTag');
        } catch (err) { }

        const finalStoreItems = await storage.read([ 'pocoItem', 'pocoStoreItem' ]);
        assert.strictEqual(finalStoreItems.pocoItem.count, 100);
        assert.strictEqual(finalStoreItems.pocoStoreItem.count, 100);

        nockDone;
    });

    // THESE TESTS REQUIRE THAT COSMOS DB EMULATOR IS INSTALLED AND STARTED !!!!!!!!!!!!!!!!!!!!!!
    // it('delete with partition key', function() {
    //     return usingNock(this.test, mode, options)
    //         .then(({ nockDone, context }) => {
    //             let storage = new CosmosDbPartitionedStorage(getSettings());
    //             return (storage.write(changes))
    //                 .then(() => storage.delete(['001']))
    //                 .then(() => storage.read(['001']))
    //                 .then(result => {
    //                     assert(!result['001'], 'result should not be found');
    //                 }).catch(reason => {
    //                     if (reason.code == 'ECONNREFUSED') {
    //                         console.log(noEmulatorMessage);
    //                     } else {
    //                         assert(false, `should not throw: ${ print(reason) }`);
    //                     }
    //                 })
    //                 .then(nockDone);
    //         });
    // });

    // it('read with partition key', function() {
    //     return usingNock(this.test, mode, options)
    //         .then(({ nockDone, context }) => {
    //             let storage = new CosmosDbPartitionedStorage(getSettings());
    //             return (storage.write(changes))
    //                 .then(() => storage.read(['001']))
    //                 .then(result => {
    //                     assert(result['001'], 'result should be found');
    //                 }).catch(reason => {
    //                     if (reason.code == 'ECONNREFUSED') {
    //                         console.log(noEmulatorMessage);
    //                     } else {
    //                         assert(false, `should not throw: ${print(reason)}`);
    //                     }
    //                 })
    //                 .then(nockDone);
    //         });
    // });

    // it('read without partition key', function() {
    //     return usingNock(this.test, mode, options)
    //         .then(({ nockDone, context }) => {
    //             let storage = new CosmosDbPartitionedStorage(getSettings());
    //             return (storage.write(changes))
    //                 .then(() => storage.read(['001']))
    //                 .catch((reason) => {
    //                     assert(reason.code === 400, `should throw an exception, code 400: Cross partition query is required but disabled.`);
    //                 })
    //                 .then(nockDone);
    //         });
    // });

    // it('read of unknown key', function () {
    //     return usingNock(this.test, mode, options)
    //         .then(({ nockDone, context }) => {
    //             let storage = new CosmosDbPartitionedStorage(getSettings(), policyConfigurator);
    //             return storage.read(['unk'])
    //                 .then((result) => {
    //                     assert(result != null, 'result should be object');
    //                     assert(!result.unk, 'key should be undefined');
    //                 })
    //                 .catch(reason => {
    //                     if (reason.code == 'ECONNREFUSED') {
    //                         console.log(noEmulatorMessage);
    //                     } else {
    //                         assert(false, `should not throw: ${print(reason)}`);
    //                     }
    //                 })
    //                 .then(nockDone);
    //         });
    // });

    // it('key creation', function () {
    //     return usingNock(this.test, mode, options)
    //         .then(({ nockDone, context }) => {
    //             let storage = new CosmosDbPartitionedStorage(getSettings(), policyConfigurator);
    //             return storage.write({ keyCreate: { count: 1 } })
    //                 .then(() => storage.read(['keyCreate']))
    //                 .then((result) => {
    //                     assert(result != null, 'result should be object');
    //                     assert(result.keyCreate != null, 'keyCreate should be defined');
    //                     assert(result.keyCreate.count == 1, 'object should have count of 1');
    //                     assert(!result.eTag, 'ETag should be defined');
    //                 })
    //                 .catch(reason => {
    //                     if (reason.code == 'ECONNREFUSED') {
    //                         console.log(noEmulatorMessage);
    //                     } else {
    //                         assert(false, `should not throw: ${print(reason)}`);
    //                     }
    //                 })
    //                 .then(nockDone);
    //         });
    // });

    // it('key update', function () {
    //     return usingNock(this.test, mode, options)
    //         .then(({ nockDone, context }) => {
    //             let storage = new CosmosDbPartitionedStorage(getSettings(), policyConfigurator);
    //             return storage.write({ keyUpdate: { count: 1 } })
    //                 .then(() => storage.read(['keyUpdate']))
    //                 .then((result) => {
    //                     result.keyUpdate.count = 2;
    //                     return storage.write(result)
    //                         .then(() => storage.read(['keyUpdate']))
    //                         .then((updated) => {
    //                             assert(updated.keyUpdate.count == 2, 'object should be updated');
    //                             assert(updated.keyUpdate.eTag != result.keyUpdate.eTag, 'Etag should be updated on write');
    //                         });
    //                 }).catch(reason => {
    //                     if (reason.code == 'ECONNREFUSED') {
    //                         console.log(noEmulatorMessage);
    //                     } else {
    //                         assert(false, `should not throw: ${print(reason)}`);
    //                     }
    //                 })
    //                 .then(nockDone);
    //         });
    // });

    // it('invalid eTag', function () {
    //     return usingNock(this.test, mode, options)
    //         .then(({ nockDone, context }) => {
    //             let storage = new CosmosDbPartitionedStorage(getSettings(), policyConfigurator);
    //             return storage.write({ keyUpdate2: { count: 1 } })
    //                 .then(() => storage.read(['keyUpdate2']))
    //                 .then((result) => {
    //                     result.keyUpdate2.count = 2;
    //                     return storage.write(result).then(() => {
    //                         result.keyUpdate2.count = 3;
    //                         return storage.write(result)
    //                             .then(() => assert(false, `should throw an exception on second write with same etag: ${print(reason)}`))
    //                             .catch((reason) => { });
    //                     });
    //                 })
    //                 .catch(reason => {
    //                     if (reason.code == 'ECONNREFUSED') {
    //                         console.log(noEmulatorMessage);
    //                     } else {
    //                         assert(false, `should not throw: ${print(reason)}`);
    //                     }
    //                 })
    //                 .then(nockDone);
    //         });
    // });

    // it('wildcard eTag', function () {
    //     return usingNock(this.test, mode, options)
    //         .then(({ nockDone, context }) => {
    //             let storage = new CosmosDbPartitionedStorage(getSettings(), policyConfigurator);
    //             return storage.write({ keyUpdate3: { count: 1 } })
    //                 .then(() => storage.read(['keyUpdate3']))
    //                 .then((result) => {
    //                     result.keyUpdate3.eTag = '*';
    //                     result.keyUpdate3.count = 2;
    //                     return storage.write(result).then(() => {
    //                         result.keyUpdate3.count = 3;
    //                         return storage.write(result)
    //                             .catch((reason) => assert(false, `should NOT fail on etag writes with wildcard: ${print(reason)}`));
    //                     });
    //                 })
    //                 .catch(reason => {
    //                     if (reason.code == 'ECONNREFUSED') {
    //                         console.log(noEmulatorMessage);
    //                     } else {
    //                         assert(false, `should not throw: ${print(reason)}`);
    //                     }
    //                 })
    //                 .then(nockDone);
    //         });
    // });

    // it('delete unknown', function () {
    //     return usingNock(this.test, mode, options)
    //         .then(({ nockDone, context }) => {
    //             let storage = new CosmosDbPartitionedStorage(getSettings(), policyConfigurator);
    //             return storage.delete(['unknown'])
    //                 .catch(reason => {
    //                     if (reason.code == 'ECONNREFUSED') {
    //                         console.log(noEmulatorMessage);
    //                     } else {
    //                         console.log(reason)
    //                         assert(false, `should not throw: ${print(reason)}`);
    //                     }
    //                 })
    //                 .then(nockDone);
    //         });
    // });

    // it('delete known', function () {
    //     return usingNock(this.test, mode, options)
    //         .then(({ nockDone, context }) => {
    //             let storage = new CosmosDbPartitionedStorage(getSettings(), policyConfigurator);
    //             return storage.write({ delete1: { count: 1 } })
    //                 .then(() => storage.delete(['delete1']))
    //                 .then(() => storage.read(['delete1']))
    //                 .then(result => {
    //                     // if (result.delete1)
    //                     //     console.log(JSON.stringify(result.delete1));
    //                     assert(!result.delete1, 'delete1 should not be found');
    //                 })
    //                 .catch(reason => {
    //                     if (reason.code == 'ECONNREFUSED') {
    //                         console.log(noEmulatorMessage);
    //                     } else {
    //                         assert(false, `should not throw: ${print(reason)}`);
    //                     }
    //                 })
    //                 .then(nockDone);
    //         });
    // });

    // it('batch operations', function () {
    //     return usingNock(this.test, mode, options)
    //         .then(({ nockDone, context }) => {
    //             let storage = new CosmosDbPartitionedStorage(getSettings(), policyConfigurator);
    //             return storage.write({
    //                 batch1: { count: 10 },
    //                 batch2: { count: 20 },
    //                 batch3: { count: 30 },
    //             })
    //                 .then(() => storage.read(['batch1', 'batch2', 'batch3']))
    //                 .then((result) => {
    //                     assert(result.batch1 != null, 'batch1 should exist and doesnt');
    //                     assert(result.batch2 != null, 'batch2 should exist and doesnt');
    //                     assert(result.batch3 != null, 'batch3 should exist and doesnt');
    //                     assert(result.batch1.count > 0, 'batch1 should have count and doesnt');
    //                     assert(result.batch2.count > 0, 'batch2 should have count and doesnt');
    //                     assert(result.batch3.count > 0, 'batch3 should have count  and doesnt');
    //                     assert(result.batch1.eTag != null, 'batch1 should have etag and doesnt');
    //                     assert(result.batch2.eTag != null, 'batch2 should have etag and doesnt');
    //                     assert(result.batch3.eTag != null, 'batch3 should have etag  and doesnt');
    //                 })
    //                 .then(() => storage.delete(['batch1', 'batch2', 'batch3']))
    //                 .then(() => storage.read(['batch1', 'batch2', 'batch3']))
    //                 .then((result) => {
    //                     assert(!result.batch1, 'batch1 should not exist and does');
    //                     assert(!result.batch2, 'batch2 should not exist and does');
    //                     assert(!result.batch3, 'batch3 should not exist and does');
    //                 })
    //                 .catch(reason => {
    //                     if (reason.code == 'ECONNREFUSED') {
    //                         console.log(noEmulatorMessage);
    //                     } else {
    //                         assert(false, `should not throw: ${print(reason)}`);
    //                     }
    //                 })
    //                 .then(nockDone);
    //         });
    // });

    // it('crazy keys work', function () {
    //     return usingNock(this.test, mode, options)
    //         .then(({ nockDone, context }) => {
    //             let storage = new CosmosDbPartitionedStorage(getSettings(), policyConfigurator);
    //             let obj = {};
    //             let crazyKey = '!@#$%^&*()_+??><":QASD~`';
    //             obj[crazyKey] = { count: 1 };
    //             return storage.write(obj)
    //                 .then(() => storage.read([crazyKey]))
    //                 .then((result) => {
    //                     assert(result != null, 'result should be object');
    //                     assert(result[crazyKey], 'keyCreate should be defined');
    //                     assert(result[crazyKey].count == 1, 'object should have count of 1');
    //                     assert(result[crazyKey].eTag, 'ETag should be defined');
    //                 })
    //                 .catch(reason => {
    //                     if (reason.code == 'ECONNREFUSED') {
    //                         console.log(noEmulatorMessage);
    //                     } else {
    //                         console.log(reason)
    //                         assert(false, `should not throw: ${print(reason)}`);
    //                     }
    //                 })
    //                 .then(nockDone);
    //         });
    // });

    // it('should call connectionPolicyConfigurator', function () {
    //     let policy = null;
    //     let storage = new CosmosDbPartitionedStorage(getSettings(), (policyInstance) => policy = policyInstance);

    //     assert(policy != null, 'connectionPolicyConfigurator should have been called.')
    // });
};

// describe('CosmosDbPartitionedStorage Constructor', function () {
//     it('missing settings should throw', function () {
//         assert.throws(() => new CosmosDbPartitionedStorage(), Error, 'constructor should have thrown error about missing settings.');
//     });

//     it('missing settings endpoint should be thrown - null value', function () {
//         let testSettings = {
//             serviceEndpoint: null,
//             authKey: 'testKey',
//             databaseId: 'testDataBaseID',
//             collectionId: 'testCollectionID'
//         };

//         assert.throws(() => new CosmosDbPartitionedStorage(testSettings), Error, 'constructor should have thrown error about missing service Endpoint.')
//     });

//     it('missing settings endpoint should be thrown - empty value', function () {
//         let testSettings = {
//             serviceEndpoint: '',
//             authKey: 'testKey',
//             databaseId: 'testDataBaseID',
//             collectionId: 'testCollectionID'
//         };

//         assert.throws(() => new CosmosDbPartitionedStorage(testSettings), Error, 'constructor should have thrown error about missing service Endpoint.')
//     });

//     it('missing settings endpoint should be thrown - white spaces', function () {
//         let testSettings = {
//             serviceEndpoint: '   ',
//             authKey: 'testKey',
//             databaseId: 'testDataBaseID',
//             collectionId: 'testCollectionID'
//         };

//         assert.throws(() => new CosmosDbPartitionedStorage(testSettings), Error, 'constructor should have thrown error about missing service Endpoint.')
//     });

//     it('missing settings authKey should be thrown - null value', function () {
//         let testSettings = {
//             serviceEndpoint: 'testEndpoint',
//             authKey: null,
//             databaseId: 'testDataBaseID',
//             collectionId: 'testCollectionID'
//         };

//         assert.throws(() => new CosmosDbPartitionedStorage(testSettings), Error, 'constructor should have thrown error about missing authKey.')
//     });

//     it('missing settings authKey should be thrown - empty value', function () {
//         let testSettings = {
//             serviceEndpoint: 'testEndpoint',
//             authKey: '',
//             databaseId: 'testDataBaseID',
//             collectionId: 'testCollectionID'
//         };

//         assert.throws(() => new CosmosDbPartitionedStorage(testSettings), Error, 'constructor should have thrown error about missing authKey.')
//     });

//     it('missing settings authKey should be thrown - white spaces', function () {
//         let testSettings = {
//             serviceEndpoint: 'testEndpoint',
//             authKey: '   ',
//             databaseId: 'testDataBaseID',
//             collectionId: 'testCollectionID'
//         };

//         assert.throws(() => new CosmosDbPartitionedStorage(testSettings), Error, 'constructor should have thrown error about missing authKey.')
//     });

//     it('missing settings databaseId should be thrown - null value', function () {
//         let testSettings = {
//             serviceEndpoint: 'testEndpoint',
//             authKey: 'testKey',
//             databaseId: null,
//             collectionId: 'testCollectionID'
//         };

//         assert.throws(() => new CosmosDbPartitionedStorage(testSettings), Error, 'constructor should have thrown error about missing database ID.')
//     });

//     it('missing settings databaseId should be thrown - empty value', function () {
//         let testSettings = {
//             serviceEndpoint: 'testEndpoint',
//             authKey: 'testKey',
//             databaseId: '',
//             collectionId: 'testCollectionID'
//         };

//         assert.throws(() => new CosmosDbPartitionedStorage(testSettings), Error, 'constructor should have thrown error about missing database ID.')
//     });

//     it('missing settings databaseId should be thrown - white spaces', function () {
//         let testSettings = {
//             serviceEndpoint: 'testEndpoint',
//             authKey: 'testKey',
//             databaseId: '    ',
//             collectionId: 'testCollectionID'
//         };

//         assert.throws(() => new CosmosDbPartitionedStorage(testSettings), Error, 'constructor should have thrown error about missing database ID.')
//     });

//     it('missing settings collectionId should be thrown - null value', function () {
//         let testSettings = {
//             serviceEndpoint: 'testEndpoint',
//             authKey: 'testKey',
//             databaseId: 'testDataBaseID',
//             collectionId: null
//         };

//         assert.throws(() => new CosmosDbPartitionedStorage(testSettings), Error, 'constructor should have thrown error about missing collection ID.')
//     });

//     it('missing settings collectionId should be thrown - empty value', function () {
//         let testSettings = {
//             serviceEndpoint: 'testEndpoint',
//             authKey: 'testKey',
//             databaseId: 'testDataBaseID',
//             collectionId: ''
//         };

//         assert.throws(() => new CosmosDbPartitionedStorage(testSettings), Error, 'constructor should have thrown error about missing collection ID.')
//     });

//     it('missing settings collectionId should be thrown - white spaces', function () {
//         let testSettings = {
//             serviceEndpoint: 'testEndpoint',
//             authKey: 'testKey',
//             databaseId: 'testDataBaseID',
//             collectionId: '    '
//         };

//         assert.throws(() => new CosmosDbPartitionedStorage(testSettings), Error, 'constructor should have thrown error about missing collection ID.')
//     });
// });

describe('CosmosDbPartitionedStorage', function() {
    this.timeout(20000);
    before('cleanup', reset);
    testStorage();
    after('cleanup', reset);
});

// These tests use the same Cosmos DB configuration, but are not expected to call the Cosmos DB Emulator.
// describe('CosmosDbPartitionedStorage - Offline tests', function () {
//     it('should return empty object when null is passed in to read()', async function () {
//         const storage = new CosmosDbPartitionedStorage(getSettings(), policyConfigurator);
//         const storeItems = await storage.read(null);
//         assert.deepEqual(storeItems, {}, `did not receive empty object, instead received ${JSON.stringify(storeItems)}`);
//     });

//     it('should return empty object when no keys are passed in to read()', async function () {
//         const storage = new CosmosDbPartitionedStorage(getSettings(), policyConfigurator);
//         const storeItems = await storage.read([]);
//         assert.deepEqual(storeItems, {}, `did not receive empty object, instead received ${JSON.stringify(storeItems)}`);
//     });

//     it('should not blow up when no changes are passed in to write()', async function () {
//         const storage = new CosmosDbPartitionedStorage(getSettings(), policyConfigurator);
//         const storeItems = await storage.write({});
//     });

//     it('should not blow up when null is passed in to write()', async function () {
//         const storage = new CosmosDbPartitionedStorage(getSettings(), policyConfigurator);
//         const storeItems = await storage.write(null);
//     });

//     it('should not blow up when no keys are passed in to delete()', async function () {
//         const storage = new CosmosDbPartitionedStorage(getSettings(), policyConfigurator);
//         const storeItems = await storage.delete([]);
//     });

//     it('should not blow up when null is passed in to delete()', async function () {
//         const storage = new CosmosDbPartitionedStorage(getSettings(), policyConfigurator);
//         const storeItems = await storage.delete(null);
//     });
// });