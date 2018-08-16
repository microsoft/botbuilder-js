const assert = require('assert');
const { AzureBlobTranscriptStore } = require('../');
const azure = require('azure-storage');
const base = require('../../botbuilder/tests/transcriptStoreBaseTest');

const getSettings = (container = null) => ({
    storageAccountOrConnectionString: 'UseDevelopmentStorage=true;',
    containerName: container || 'test-transcript'
});

const noEmulatorMessage = 'skipping test because azure storage emulator is not running';
const settings = getSettings();
const useParallel = settings.storageAccountOrConnectionString !== 'UseDevelopmentStorage=true;';

const reset = (done) => {
    let settings = getSettings();
    let client = azure.createBlobService(settings.storageAccountOrConnectionString, settings.storageAccessKey);
    client.deleteContainerIfExists(settings.containerName, (err, result) => done());
}

const handleConnectionError = (reason) => {
    if (reason.code == 'ECONNREFUSED') {
        console.log(noEmulatorMessage);
    } else {
        assert(false, `should not throw: ${print(reason)}`);
    }
}

const print = (o) => {
    return JSON.stringify(o, null, '  ');
}

testStorage = function () {

    it('bad args', function () {
        let storage = new AzureBlobTranscriptStore(settings);
        return base._badArgs(storage)
            .then(messages => {
                assert(messages.every(message => message.startsWith('expected error')));
            })
            .catch(handleConnectionError)
    })

    it('log activity', function () {
        let storage = new AzureBlobTranscriptStore(settings);
        return base._logActivity(storage)
            .then(() => assert(true))
            .catch(handleConnectionError)
    })

    it('log multiple activities', function () {
        let storage = new AzureBlobTranscriptStore(settings);
        return base._logMultipleActivities(storage, useParallel)
            .then(() => assert(true))
            .catch(handleConnectionError)
    })

    it('delete transcript', function () {
        let storage = new AzureBlobTranscriptStore(settings);
        return base._deleteTranscript(storage, useParallel)
            .then(() => assert(true))
            .catch(handleConnectionError)
    })

    it('get transcript activities', function () {
        let storage = new AzureBlobTranscriptStore(settings);
        return base._getTranscriptActivities(storage, useParallel)
            .then(() => assert(true))
            .catch(handleConnectionError)
    })

    it('get transcript activities with startDate', function () {
        let storage = new AzureBlobTranscriptStore(settings);
        return base._getTranscriptActivitiesStartDate(storage, useParallel)
            .then(() => assert(true))
            .catch(handleConnectionError)
    })

    it('list transcripts', function () {
        let storage = new AzureBlobTranscriptStore(settings);
        return base._listTranscripts(storage, useParallel)
            .then(() => assert(true))
            .catch(handleConnectionError)
    })
}

xdescribe('AzureBlobTranscriptStore', function () {
    this.timeout(20000);
    before('cleanup', reset);
    testStorage();
    after('cleanup', reset);
});

