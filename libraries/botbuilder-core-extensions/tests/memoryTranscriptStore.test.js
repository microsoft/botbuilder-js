const { MemoryTranscriptStore } = require('../');

const assert = require('assert');
const base = require('./transcriptStoreBaseTest');

const print = (o) => {
    return JSON.stringify(o, null, '  ');
}

testStorage = function () {

    it('bad args', function () {
        let storage = new MemoryTranscriptStore();
        return base._badArgs(storage)
            .then(messages => {
                assert(messages.every(message => message.startsWith('expected error')));
            })
            .catch(reason =>
                assert(false, `should not throw: ${print(reason)}`))
    })

    it('log activity', function () {
        let storage = new MemoryTranscriptStore();
        return base._logActivity(storage)
            .then(() => assert(true))
            .catch(reason =>
                assert(false, `should not throw: ${print(reason)}`))
    })

    it('logs multiple activities', function () {
        let storage = new MemoryTranscriptStore();
        return base._logMultipleActivities(storage)
            .then(() => assert(true))
            .catch(reason =>
                assert(false, `should not throw: ${print(reason)}`))
    })

    it('delete transcript', function() {
        let storage = new MemoryTranscriptStore();
        return base._deleteTranscript(storage)
            .then(() => assert(true))
            .catch(reason =>
                assert(false, `should not throw: ${print(reason)}`))
    })

    it('get transcript activities', function() {
        let storage = new MemoryTranscriptStore();
        return base._getTranscriptActivities(storage)
            .then(() => assert(true))
            .catch(reason =>
                assert(false, `should not throw: ${print(reason)}`))
    })

    it('get transcript activities with state date', function() {
        let storage = new MemoryTranscriptStore();
        return base._getTranscriptActivitiesStartDate(storage)
            .then(() => assert(true))
            .catch(reason =>
                assert(false, `should not throw: ${print(reason)}`))
    })

    it('list transcripts', function() {
        let storage = new MemoryTranscriptStore();
        return base._listTranscripts(storage)
            .then(() => assert(true))
            .catch(reason =>
                assert(false, `should not throw: ${print(reason)}`))
    })
}

describe('MemoryTranscriptStore', function () {
    this.timeout(10000);
    testStorage();
});

