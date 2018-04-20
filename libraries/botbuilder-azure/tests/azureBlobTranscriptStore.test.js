const assert = require('assert');
const { AzureBlobTranscriptStore } = require('../');
const azure = require('azure-storage');
const base = require('../../botbuilder-core-extensions/tests/transcriptStoreBaseTest');

const getSettings = (container = null) => ({
    storageAccountOrConnectionString: 'UseDevelopmentStorage=true;',
    containerName: container || 'test-transcript'
});

const reset = (done) => {
    let settings = getSettings();
    let client = azure.createBlobService(settings.storageAccountOrConnectionString, settings.storageAccessKey);
    client.deleteContainerIfExists(settings.containerName, (err, result) => done());
}

const print = (o) => {
    return JSON.stringify(o, null, '  ');
}

testStorage = function () {
    
    const noEmulatorMessage = 'skipping test because azure storage emulator is not running';

    it('bad args', function () {
        let storage = new AzureBlobTranscriptStore(getSettings());
        return base._badArgs(storage)
        .then(messages => {
            assert(messages.every(message => message.startsWith('expected error')));
        })
        .catch(reason => {
            if (reason.code == 'ECONNREFUSED') {
                console.log(noEmulatorMessage);
            } else {
                assert(false, `should not throw: ${print(reason)}`);
            }
        })
    })
    
    it('log activity', function () {
        let storage = new AzureBlobTranscriptStore(getSettings());
        return base._logActivity(storage)
        .then(() => assert(true))
        .catch(reason => {
            if (reason.code == 'ECONNREFUSED') {
                console.log(noEmulatorMessage);
            } else {
                assert(false, `should not throw: ${print(reason)}`);
            }
        })
    })  
    
    it('get transcript activities', function () {
        let storage = new AzureBlobTranscriptStore(getSettings());
        return base._getTranscriptActivities(storage, false)
        .then(() => assert(true))
        .catch(reason => {
            if (reason.code == 'ECONNREFUSED') {
                console.log(noEmulatorMessage);
            } else {
                assert(false, `should not throw: ${print(reason)}`);
            }
        })
    })
}

describe('AzureBlobTranscriptStore', function () {
    this.timeout(20000);
    before('cleanup', reset);
    testStorage();
    after('cleanup', reset);
});

