const assert = require('assert');
const { TableStorage, StoreItemContainer } = require('../');
const azureStorage = require('azure-storage');
var fs = require('fs');
var child_process = require('child_process');

const connectionString = 'UseDevelopmentStorage=true';
const testTableName = 'storagetests';

testStorage = function () {
    var storage = new TableStorage({ tableName: testTableName, storageAccountOrConnectionString: connectionString });

    // cleanup
    after((done) => {
        var table = new azureStorage.TableService(connectionString);
        table.deleteTableIfExists(testTableName, () => done());
    });

    // check & start emulator
    before(function () {
        if (process.platform === 'win32') {
            var emulatorPath = "c:/Program Files (x86)/Microsoft SDKs/Azure/Storage Emulator/azurestorageemulator.exe";
            if (!fs.existsSync(emulatorPath)) {
                console.log('skipping azure storage tests because azure storage emulator is not installed');
                this.skip();
            }
            else {
                child_process.spawnSync(emulatorPath, ['start']);
            }
        }
    });

    function handleError(err) {
        if (err.code == 'ECONNREFUSED') {
            console.log('skipping test because azure storage emulator is not running');
        } else {
            console.error('error', err);
            assert(false, 'should not throw');
        }
    }

    function randomString(size) {
        var text = '';
        var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        for (var i = 0; i < size; i++) {
            text += chars.charAt(Math.floor(chars.length * Math.random()));
        }

        return text;
    }

    function getValueOf(value) {
        return (typeof value.valueOf  === 'function')
            ? value.valueOf()
            : value;
    }

    it('read of unknown key', function () {
        return storage.read(['unk'])
            .then((result) => {
                assert(result != null, 'result should be object');
                assert(!result.unk, 'key should be undefined');
            })
            .catch(handleError);
    });

    it('key creation', function () {
        return storage.write({ keyCreate: { count: 1 } })
            .then(() => storage.read(['keyCreate']))
            .then((result) => {
                assert(result != null, 'result should be object');
                assert(result.keyCreate != null, 'keyCreate should be defined');
                assert(result.keyCreate.count == 1, 'object should have count of 1');
                assert(!result.eTag, 'ETag should be defined');
            })
            .catch(handleError);
    });

    it('saves with proper types', function () {
        var typesObj = {
            int32: 1,
            int64: 9007199254740992,
            double: Math.PI,
            boolean: true,
            stringy: "hello world!",
            date: new Date()
        };

        return storage.write({ types: typesObj })
            .then(() => storage.read(['types']))
            .then((result) => {
                assert(result != null, 'result should be object');
                assert(result.types != null, 'result.types should be object');
                var retrievedTypes = result.types;
                Object.keys(typesObj).forEach(key => {
                    assert(getValueOf(retrievedTypes[key]) === getValueOf(typesObj[key]), key + ' should be equal: ' + retrievedTypes[key] + ' !== ' + typesObj[key]);
                });
            })
            .catch(handleError);
    });

    it('key update', function () {
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
            })
            .catch(handleError);
    });

    it('invalid eTag', function () {
        return storage.write({ keyUpdate2: { count: 1 } })
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
            .catch(handleError);
    });

    it('wildcard eTag', function () {
        return storage.write({ keyUpdate3: { count: 1 } })
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
            .catch(handleError);
    });

    it('delete unknown', function () {
        return storage.delete(['unknown'])
            .catch(handleError);
    });

    it('delete known', function () {
        return storage.write({ delete1: { count: 1 } })
            .then(() => storage.delete(['delete1']))
            .then(() => storage.read(['delete1']))
            .then(result => {
                if (result.delete1)
                    console.log(JSON.stringify(result.delete1));
                assert(!result.delete1, 'delete1 should not be found');
            })
            .catch(handleError);
    });

    it('batch operations', function () {
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
            .catch(handleError);
    });

    it('crazy keys work', function () {
        var obj = {};
        var crazyKey = '!@#$%^&*()_+??><":QASD~`';
        obj[crazyKey] = { count: 1 };
        return storage.write(obj)
            .then(() => storage.read([crazyKey]))
            .then((result) => {
                assert(result != null, 'result should be object');
                assert(result[crazyKey], 'keyCreate should be defined');
                assert(result[crazyKey].count == 1, 'object should have count of 1');
                assert(result[crazyKey].eTag, 'ETag should be defined');
            })
            .catch(handleError);
    });

    it('create large object', function () {
        var bigString = randomString(30000);
        var changes = {
            bigObject: {
                text1: '1' + bigString,
                text2: '2' + bigString,
                text3: '3' + bigString
            }
        };

        return storage.write(changes)
            .then(() => storage.read(['bigObject']))
            .then(result => {
                assert(result != null, 'result should be object');
                assert(result.bigObject, 'bigObject is not defined');
                assert.equal(result.bigObject.text1, '1' + bigString);
                assert.equal(result.bigObject.text2, '2' + bigString);
                assert.equal(result.bigObject.text3, '3' + bigString);
            })
            .catch(handleError);
    });

    it('update large object with etag', function () {
        var bigString = randomString(20000);
        var newString = randomString(30000);
        var changes = {
            bigObjectWithEtag: {
                text: bigString
            }
        };

        return storage.write(changes)
            .then(() => storage.read(['bigObjectWithEtag']))
            .then((obj) => {
                obj.bigObjectWithEtag.text = newString;
                return storage.write(obj);
            })
            .then(() => storage.read(['bigObjectWithEtag']))
            .then(result => {
                assert(result != null, 'result should be object');
                assert(result.bigObjectWithEtag, 'bigObjectWithEtag is not defined');
                assert.equal(result.bigObjectWithEtag.text, newString);
            })
            .catch(handleError);
    });

    it('table name should be validated', function () {
        var invalidSampleNames = ['test-test', '0001test', 'test_test', ''];
        invalidSampleNames.forEach(invalidName =>
            assert.throws(() =>
                new TableStorage({ tableName: invalidName, storageAccountOrConnectionString: connectionString }),
                (err) => err.message.includes('table name')));
    });
}

describe('TableStorage', function () {
    this.timeout(10000);
    testStorage();
});