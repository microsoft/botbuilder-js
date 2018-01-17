const assert = require('assert');
const azure = require('../');
const azureStorage = require('azure-storage');
var fs = require('fs');
var child_process = require('child_process');

testStorage = function () {
    let connectionString = 'UseDevelopmentStorage=true';
    before(function () {
        let emulatorPath = "c:/Program Files (x86)/Microsoft SDKs/Azure/Storage Emulator/azurestorageemulator.exe";
        if (!fs.existsSync(emulatorPath)){
            console.log('skipping azure storage tests because azure storage emulator is not installed');
            this.skip();
        }
        else
            child_process.spawnSync(emulatorPath, ['start']);
    });

    it('read of unknown key', function () {
        let storage = new azure.TableStorage({ tableName: 'unknown', storageAccountOrConnectionString: connectionString });
        return storage.deleteTable(storage.settings.tableName)
            .then(deleted => storage.read(['unk']))
            .then((result) => {
                assert(result != null, 'result should be object');
                assert(!result.unk, 'key should be undefined');
            })
            .catch(reason => {
                if (reason.code == 'ECONNREFUSED')
                    console.log('skipping test because azure storage emulator is not running');
                else
                    assert(false, 'should not throw');
            });
    });

    it('key creation', function () {
        let storage = new azure.TableStorage({ tableName: 'keyCreate', storageAccountOrConnectionString: connectionString });
        return storage.deleteTable(storage.settings.tableName)
            .then((deleted) => storage.write({ keyCreate: { count: 1 } }))
            .then(() => storage.read(['keyCreate']))
            .then((result) => {
                assert(result != null, 'result should be object');
                assert(result.keyCreate != null, 'keyCreate should be defined');
                assert(result.keyCreate.count == 1, 'object should have count of 1');
                assert(!result.eTag, 'ETag should be defined');
            })
            .catch(reason => {
                if (reason.code == 'ECONNREFUSED')
                    console.log('skipping test because azure storage emulator is not running');
                else
                    assert(false, 'should not throw');
            });
    });

    it('key update', function () {
        let storage = new azure.TableStorage({ tableName: 'keyUpdate', storageAccountOrConnectionString: connectionString });
        return storage.deleteTable(storage.settings.tableName)
            .then((deleted) => storage.write({ keyUpdate: { count: 1 } }))
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
                if (reason.code == 'ECONNREFUSED')
                    console.log('skipping test because azure storage emulator is not running');
                else
                    assert(false, 'should not throw');
            });
    });

    it('invalid eTag', function () {
        let storage = new azure.TableStorage({ tableName: 'invalidETag', storageAccountOrConnectionString: connectionString });
        return storage.deleteTable(storage.settings.tableName)
            .then((deleted) => storage.write({ keyUpdate2: { count: 1 } }))
            .then(() => storage.read(['keyUpdate2']))
            .then((result) => {
                result.keyUpdate2.count = 2;
                return storage.write(result).then(() => {
                    result.keyUpdate2.count = 3;
                    return storage.write(result)
                        .then(() => assert(false, 'should throw an exception on second write with same etag'))
                        .catch((reason) => { });
                });
            })
            .catch(reason => {
                if (reason.code == 'ECONNREFUSED')
                    console.log('skipping test because azure storage emulator is not running');
                else
                    assert(false, 'should not throw');
            });
    });

    it('wildcard eTag', function () {
        let storage = new azure.TableStorage({ tableName: 'wildcards', storageAccountOrConnectionString: connectionString });
        return storage.deleteTable(storage.settings.tableName)
            .then((deleted) => storage.write({ keyUpdate3: { count: 1 } }))
            .then(() => storage.read(['keyUpdate3']))
            .then((result) => {
                result.keyUpdate3.eTag = '*';
                result.keyUpdate3.count = 2;
                return storage.write(result).then(() => {
                    result.keyUpdate3.count = 3;
                    return storage.write(result)
                        .catch((reason) => assert(false, 'should NOT fail on etag writes with wildcard'));
                });
            })
            .catch(reason => {
                if (reason.code == 'ECONNREFUSED')
                    console.log('skipping test because azure storage emulator is not running');
                else
                    assert(false, 'should not throw');
            });
    });

    it('delete unknown', function () {
        let storage = new azure.TableStorage({ tableName: 'deleteUnknown', storageAccountOrConnectionString: connectionString });
        return storage.deleteTable(storage.settings.tableName)
            .then((deleted) => storage.delete(['unknown']))
            .catch(reason => {
                if (reason.code == 'ECONNREFUSED')
                    console.log('skipping test because azure storage emulator is not running');
                else
                    assert(false, 'should not fail delete of unknown key');
            });
    });

    it('delete known', function () {
        let storage = new azure.TableStorage({ tableName: 'delete', storageAccountOrConnectionString: connectionString });
        return storage.deleteTable(storage.settings.tableName)
            .then((deleted) => storage.write({ delete1: { count: 1 } }))
            .then(() => storage.delete(['delete1']))
            .then(() => storage.read(['delete1']))
            .then(result => {
                if (result.delete1)
                    console.log(JSON.stringify(result.delete1));
                assert(!result.delete1, 'delete1 should not be found');
            })
            .catch(reason => {
                if (reason.code == 'ECONNREFUSED')
                    console.log('skipping test because azure storage emulator is not running');
                else
                    assert(false, 'should not throw');
            });

    });

    it('batch operations', function () {
        let storage = new azure.TableStorage({ tableName: 'batch', storageAccountOrConnectionString: connectionString });
        return storage.deleteTable(storage.settings.tableName)
            .then((deleted) => storage.write({
                batch1: { count: 10 },
                batch2: { count: 20 },
                batch3: { count: 30 },
            }))
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
                if (reason.code == 'ECONNREFUSED')
                    console.log('skipping test because azure storage emulator is not running');
                else
                    assert(false, 'should not throw');
            });

    });

    it('crazy keys work', function () {
        let storage = new azure.TableStorage({ tableName: 'crazy', storageAccountOrConnectionString: connectionString });
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
                if (reason.code == 'ECONNREFUSED')
                    console.log('skipping test because azure storage emulator is not running');
                else
                    assert(false, 'should not throw');
            });

    });

}

describe('TableStorage', function () {
    this.timeout(10000);
    testStorage();
});

