const assert = require('assert');
const { MemoryStorage } = require('../');


function testStorage(storage) {
    it('read of unknown key', function () {
        return storage.read(['unk'])
            .catch((reson) => assert(false, 'should not throw on read of unknown key'))
            .then((result) => {
                assert(result != null, 'result should be object');
                assert(!result.unk, 'key should be undefined');
            });
    });

    it('key creation', function () {
        return storage.write({ keyCreate: { count: 1 } })
            .then(() => storage.read(['keyCreate']))
            .then((result) => {
                assert(result != null, 'result should be object');
                assert(result.keyCreate != null, 'keyCreate should be defined');
                assert(result.keyCreate.count == 1, 'object should have count of 1');
                assert(result.keyCreate.eTag, 'ETag should be defined');
            });
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
            });
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
            });
    });

    it('delete unknown', function () {
        return storage.delete(['unknown'])
            .catch((reason) => assert(false, 'should not fail delete of unknown key'));
    });

    it('delete known', function () {
        return storage.write({ delete1: { count: 1 } })
            .then(() => storage.delete(['delete1']))
            .then(() => storage.read(['delete1']))
            .then(result => {
                if (result.delete1)
                    console.log(JSON.stringify(result.delete1));
                assert(!result.delete1, 'delete1 should not be found');
            });
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
            });
    });

    it('crazy keys work', function () {
        let obj = { };
        let crazyKey = '!@#$%^&*()_+??><":QASD~`';
        obj[crazyKey] = { count: 1};
        return storage.write(obj)
            .then(() => storage.read([crazyKey]))
            .then((result) => {
                assert(result != null, 'result should be object');
                assert(result[crazyKey], 'crazyKey should be defined');
                assert(result[crazyKey].count == 1, 'object should have count of 1');
                assert(result[crazyKey].eTag, 'ETag should be defined');
            });
    });

}

describe('MemoryStorage-Empty', function () {
    testStorage(new MemoryStorage());
});

describe('MemoryStorage-PreExisting', function () {
    const dictionary = { 'test': JSON.stringify({counter:12})};
    const storage = new MemoryStorage(dictionary);
    testStorage(storage);

    it('should still have test', function() {
        return storage.read(['test']).then((result) => {
            assert(result.test.counter == 12, 'read()  test.counter should be 12');
        });
    });
});