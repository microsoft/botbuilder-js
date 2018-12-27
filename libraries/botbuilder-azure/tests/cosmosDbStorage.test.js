const assert = require('assert');
const { CosmosDbStorage } = require('../');
const { DocumentClient, UriFactory } = require('documentdb');
const { MockMode, usingNock } = require('./mockHelper');
const nock = require('nock');

const mode = process.env.MOCK_MODE ? process.env.MOCK_MODE : MockMode.lockdown;

// Endpoint and Authkey for the CosmosDB Emulator running locally
const getSettings = () => ({
    serviceEndpoint: 'https://localhost:8081',
    authKey: 'C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==',
    databaseId: 'test-db',
    collectionId: 'bot-storage'
});

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

const print = (o) => {
    return JSON.stringify(o, null, '  ');
};

const options = {
    scope: getSettings().serviceEndpoint
}

testStorage = function () {

    const noEmulatorMessage = 'skipping test because azure storage emulator is not running';

    it('read of unknown key', function () {
        return usingNock(this.test, mode, options)
        .then(({nockDone, context}) => {
            let storage = new CosmosDbStorage(getSettings(), policyConfigurator);
            return storage.read(['unk'])
            .then((result) => {
                assert(result != null, 'result should be object');
                assert(!result.unk, 'key should be undefined');
            })
            .catch(reason => {
                if (reason.code == 'ECONNREFUSED') {
                    console.log(noEmulatorMessage);
                } else {
                    assert(false, `should not throw: ${print(reason)}`);
                }
            })
            .then(nockDone);
        });
    });

    it('key creation', function () {
        return usingNock(this.test, mode, options)
        .then(({nockDone, context}) => {
            let storage = new CosmosDbStorage(getSettings(), policyConfigurator);
            return storage.write({ keyCreate: { count: 1 } })
            .then(() => storage.read(['keyCreate']))
            .then((result) => {
                assert(result != null, 'result should be object');
                assert(result.keyCreate != null, 'keyCreate should be defined');
                assert(result.keyCreate.count == 1, 'object should have count of 1');
                assert(!result.eTag, 'ETag should be defined');
            })
            .catch(reason => {
                if (reason.code == 'ECONNREFUSED') {
                    console.log(noEmulatorMessage);
                } else {
                    assert(false, `should not throw: ${print(reason)}`);
                }
            })
            .then(nockDone);
        });
    });

    it('key update', function () {
        return usingNock(this.test, mode, options)
        .then(({nockDone, context}) => {
            let storage = new CosmosDbStorage(getSettings(), policyConfigurator);
            return storage.write({ keyUpdate: { count: 1 } })
                .then(() => storage.read(['keyUpdate']))
                .then((result) => {
                    result.keyUpdate.count = 2;
                    return storage.write(result)
                        .then(() => storage.read(['keyUpdate']))
                        .then((updated) => {
                            assert(updated.keyUpdate.count == 2, 'object should be updated');
                            assert(updated.keyUpdate.eTag != result.keyUpdate.eTag, 'Etag should be updated on write');
                        });
                }).catch(reason => {
                    if (reason.code == 'ECONNREFUSED') {
                        console.log(noEmulatorMessage);
                    } else {
                        assert(false, `should not throw: ${print(reason)}`);
                    }
                })
                .then(nockDone);
        });
    });

    it('invalid eTag', function () {
        return usingNock(this.test, mode, options)
        .then(({nockDone, context}) => {
            let storage = new CosmosDbStorage(getSettings(), policyConfigurator);
            return storage.write({ keyUpdate2: { count: 1 } })
                .then(() => storage.read(['keyUpdate2']))
                .then((result) => {
                    result.keyUpdate2.count = 2;
                    return storage.write(result).then(() => {
                        result.keyUpdate2.count = 3;
                        return storage.write(result)
                            .then(() => assert(false, `should throw an exception on second write with same etag: ${print(reason)}`))
                            .catch((reason) => { });
                    });
                })
                .catch(reason => {
                    if (reason.code == 'ECONNREFUSED') {
                        console.log(noEmulatorMessage);
                    } else {
                        assert(false, `should not throw: ${print(reason)}`);
                    }
                })
                .then(nockDone);
        });
    });

    it('wildcard eTag', function () {
        return usingNock(this.test, mode, options)
        .then(({nockDone, context}) => {
            let storage = new CosmosDbStorage(getSettings(), policyConfigurator);
            return storage.write({ keyUpdate3: { count: 1 } })
                .then(() => storage.read(['keyUpdate3']))
                .then((result) => {
                    result.keyUpdate3.eTag = '*';
                    result.keyUpdate3.count = 2;
                    return storage.write(result).then(() => {
                        result.keyUpdate3.count = 3;
                        return storage.write(result)
                            .catch((reason) => assert(false, `should NOT fail on etag writes with wildcard: ${print(reason)}`));
                    });
                })
                .catch(reason => {
                    if (reason.code == 'ECONNREFUSED') {
                        console.log(noEmulatorMessage);
                    } else {
                        assert(false, `should not throw: ${print(reason)}`);
                    }
                })
                .then(nockDone);
        });
    });

    it('delete unknown', function () {
        return usingNock(this.test, mode, options)
        .then(({nockDone, context}) => {
            let storage = new CosmosDbStorage(getSettings(), policyConfigurator);
            return storage.delete(['unknown'])
                .catch(reason => {
                    if (reason.code == 'ECONNREFUSED') {
                        console.log(noEmulatorMessage);
                    } else {
                        console.log(reason)
                        assert(false, `should not throw: ${print(reason)}`);
                    }
                })
                .then(nockDone);
        });
    });

    it('delete known', function () {
        return usingNock(this.test, mode, options)
        .then(({nockDone, context}) => {
            let storage = new CosmosDbStorage(getSettings(), policyConfigurator);
            return storage.write({ delete1: { count: 1 } })
                .then(() => storage.delete(['delete1']))
                .then(() => storage.read(['delete1']))
                .then(result => {
                    // if (result.delete1)
                    //     console.log(JSON.stringify(result.delete1));
                    assert(!result.delete1, 'delete1 should not be found');
                })
                .catch(reason => {
                    if (reason.code == 'ECONNREFUSED') {
                        console.log(noEmulatorMessage);
                    } else {
                        assert(false, `should not throw: ${print(reason)}`);
                    }
                })
                .then(nockDone);
        });
    });

    it('batch operations', function () {
        return usingNock(this.test, mode, options)
        .then(({nockDone, context}) => {
            let storage = new CosmosDbStorage(getSettings(), policyConfigurator);
            return storage.write({
                batch1: { count: 10 },
                batch2: { count: 20 },
                batch3: { count: 30 },
            })
            .then(() => storage.read(['batch1', 'batch2', 'batch3']))
            .then((result) => {
                assert(result.batch1 != null, 'batch1 should exist and doesnt');
                assert(result.batch2 != null, 'batch2 should exist and doesnt');
                assert(result.batch3 != null, 'batch3 should exist and doesnt');
                assert(result.batch1.count > 0, 'batch1 should have count and doesnt');
                assert(result.batch2.count > 0, 'batch2 should have count and doesnt');
                assert(result.batch3.count > 0, 'batch3 should have count  and doesnt');
                assert(result.batch1.eTag != null, 'batch1 should have etag and doesnt');
                assert(result.batch2.eTag != null, 'batch2 should have etag and doesnt');
                assert(result.batch3.eTag != null, 'batch3 should have etag  and doesnt');
            })
            .then(() => storage.delete(['batch1', 'batch2', 'batch3']))
            .then(() => storage.read(['batch1', 'batch2', 'batch3']))
            .then((result) => {
                assert(!result.batch1, 'batch1 should not exist and does');
                assert(!result.batch2, 'batch2 should not exist and does');
                assert(!result.batch3, 'batch3 should not exist and does');
            })
            .catch(reason => {
                if (reason.code == 'ECONNREFUSED') {
                    console.log(noEmulatorMessage);
                } else {
                    assert(false, `should not throw: ${print(reason)}`);
                }
            })
            .then(nockDone);
        });
    });

    it('crazy keys work', function () {
        return usingNock(this.test, mode, options)
        .then(({nockDone, context}) => {
            let storage = new CosmosDbStorage(getSettings(), policyConfigurator);
            let obj = {};
            let crazyKey = '!@#$%^&*()_+??><":QASD~`';
            obj[crazyKey] = { count: 1 };
            return storage.write(obj)
                .then(() => storage.read([crazyKey]))
                .then((result) => {
                    assert(result != null, 'result should be object');
                    assert(result[crazyKey], 'keyCreate should be defined');
                    assert(result[crazyKey].count == 1, 'object should have count of 1');
                    assert(result[crazyKey].eTag, 'ETag should be defined');
                })
                .catch(reason => {
                    if (reason.code == 'ECONNREFUSED') {
                        console.log(noEmulatorMessage);
                    } else {
                        console.log(reason)
                        assert(false, `should not throw: ${print(reason)}`);
                    }
                })
                .then(nockDone);
        });
    });

    it('should call connectionPolicyConfigurator', function () {
        let policy = null;
        let storage = new CosmosDbStorage(getSettings(), (policyInstance) => policy = policyInstance);

        assert(policy != null, 'connectionPolicyConfigurator should have been called.')
    });
}

describe('CosmosDbStorage Constructor', function() {
    it('missing settings should throw', function() {
        assert.throws(() => new CosmosDbStorage(), Error, 'constructor should have thrown error about missing settings.');
    });

    it('missing settings endpoint should be thrown - null value', function() {
        let testSettings = {
            serviceEndpoint: null,
            authKey: 'testKey',
            databaseId: 'testDataBaseID',
            collectionId: 'testCollectionID'            
        };

        assert.throws(() => new CosmosDbStorage(testSettings), Error, 'constructor should have thrown error about missing service Endpoint.')
    });

    it('missing settings endpoint should be thrown - empty value', function() {
        let testSettings = {
            serviceEndpoint: '',
            authKey: 'testKey',
            databaseId: 'testDataBaseID',
            collectionId: 'testCollectionID'            
        };

        assert.throws(() => new CosmosDbStorage(testSettings), Error, 'constructor should have thrown error about missing service Endpoint.')
    });

    it('missing settings endpoint should be thrown - white spaces', function() {
        let testSettings = {
            serviceEndpoint: '   ',
            authKey: 'testKey',
            databaseId: 'testDataBaseID',
            collectionId: 'testCollectionID'            
        };

        assert.throws(() => new CosmosDbStorage(testSettings), Error, 'constructor should have thrown error about missing service Endpoint.')
    });

    it('missing settings authKey should be thrown - null value', function() {
        let testSettings = {
            serviceEndpoint: 'testEndpoint',
            authKey: null,
            databaseId: 'testDataBaseID',
            collectionId: 'testCollectionID'            
        };

        assert.throws(() => new CosmosDbStorage(testSettings), Error, 'constructor should have thrown error about missing authKey.')
    });

    it('missing settings authKey should be thrown - empty value', function() {
        let testSettings = {
            serviceEndpoint: 'testEndpoint',
            authKey: '',
            databaseId: 'testDataBaseID',
            collectionId: 'testCollectionID'            
        };

        assert.throws(() => new CosmosDbStorage(testSettings), Error, 'constructor should have thrown error about missing authKey.')
    });

    it('missing settings authKey should be thrown - white spaces', function() {
        let testSettings = {
            serviceEndpoint: 'testEndpoint',
            authKey: '   ',
            databaseId: 'testDataBaseID',
            collectionId: 'testCollectionID'            
        };

        assert.throws(() => new CosmosDbStorage(testSettings), Error, 'constructor should have thrown error about missing authKey.')
    });

    it('missing settings databaseId should be thrown - null value', function() {
        let testSettings = {
            serviceEndpoint: 'testEndpoint',
            authKey: 'testKey',
            databaseId: null,
            collectionId: 'testCollectionID'            
        };

        assert.throws(() => new CosmosDbStorage(testSettings), Error, 'constructor should have thrown error about missing database ID.')
    });

    it('missing settings databaseId should be thrown - empty value', function() {
        let testSettings = {
            serviceEndpoint: 'testEndpoint',
            authKey: 'testKey',
            databaseId: '',
            collectionId: 'testCollectionID'            
        };

        assert.throws(() => new CosmosDbStorage(testSettings), Error, 'constructor should have thrown error about missing database ID.')
    });

    it('missing settings databaseId should be thrown - white spaces', function() {
        let testSettings = {
            serviceEndpoint: 'testEndpoint',
            authKey: 'testKey',
            databaseId: '    ',
            collectionId: 'testCollectionID'            
        };

        assert.throws(() => new CosmosDbStorage(testSettings), Error, 'constructor should have thrown error about missing database ID.')
    });

    it('missing settings collectionId should be thrown - null value', function() {
        let testSettings = {
            serviceEndpoint: 'testEndpoint',
            authKey: 'testKey',
            databaseId: 'testDataBaseID',
            collectionId: null            
        };

        assert.throws(() => new CosmosDbStorage(testSettings), Error, 'constructor should have thrown error about missing collection ID.')
    });

    it('missing settings collectionId should be thrown - empty value', function() {
        let testSettings = {
            serviceEndpoint: 'testEndpoint',
            authKey: 'testKey',
            databaseId: 'testDataBaseID',
            collectionId: ''            
        };

        assert.throws(() => new CosmosDbStorage(testSettings), Error, 'constructor should have thrown error about missing collection ID.')
    });

    it('missing settings collectionId should be thrown - white spaces', function() {
        let testSettings = {
            serviceEndpoint: 'testEndpoint',
            authKey: 'testKey',
            databaseId: 'testDataBaseID',
            collectionId: '    '            
        };

        assert.throws(() => new CosmosDbStorage(testSettings), Error, 'constructor should have thrown error about missing collection ID.')
    });
});

describe('CosmosDbStorage', function () {
    this.timeout(20000);
    before('cleanup', reset);
    testStorage();
    after('cleanup', reset);
});

// These tests use the same Cosmos DB configuration, but are not expected to call the Cosmos DB Emulator.
describe('CosmosDbStorage - Offline tests', function () {
    it('should return empty object when null is passed in to read()', async function () {
        const storage = new CosmosDbStorage(getSettings(), policyConfigurator);
        const storeItems = await storage.read(null);
        assert.deepEqual(storeItems, {}, `did not receive empty object, instead received ${ JSON.stringify(storeItems) }`);
    });

    it('should return empty object when no keys are passed in to read()', async function () {
        const storage = new CosmosDbStorage(getSettings(), policyConfigurator);
        const storeItems = await storage.read([]);
        assert.deepEqual(storeItems, {}, `did not receive empty object, instead received ${ JSON.stringify(storeItems) }`);
    });

    it('should not blow up when no changes are passed in to write()', async function () {
        const storage = new CosmosDbStorage(getSettings(), policyConfigurator);
        const storeItems = await storage.write({});
    });

    it('should not blow up when null is passed in to write()', async function () {
        const storage = new CosmosDbStorage(getSettings(), policyConfigurator);
        const storeItems = await storage.write(null);
    });

    it('should not blow up when no keys are passed in to delete()', async function () {
        const storage = new CosmosDbStorage(getSettings(), policyConfigurator);
        const storeItems = await storage.delete([]);
    });

    it('should not blow up when null is passed in to delete()', async function () {
        const storage = new CosmosDbStorage(getSettings(), policyConfigurator);
        const storeItems = await storage.delete(null);
    });
});