const assert = require('assert');
const { ActivityTypes } = require('botbuilder-core');

function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function createActivities(conversationId, ts, count = 5) {
    var activities = [];
    for (let i = 1; i <= count; i++) {
        activities.push({
            type: ActivityTypes.Message,
            timestamp: ts,
            id: uuid(),
            text: i.toString(),
            channelId: 'test',
            from: { id: `User${i}` },
            conversation: { id: conversationId },
            recipient: { id: 'Bot1', name: '2' },
            serviceUrl: 'http://foo.com/api/messages'
        });
        ts = new Date(ts.getTime() + 60000);

        activities.push({
            type: ActivityTypes.Message,
            timestamp: ts,
            id: uuid(),
            text: i.toString(),
            channelId: 'test',
            from: { id: 'Bot1', name: '2' },
            conversation: { id: conversationId },
            recipient: { id: `User${i}` },
            serviceUrl: 'http://foo.com/api/messages'
        });
        ts = new Date(ts.getTime() + 60000);
    }
    return activities;
}

exports._badArgs = function _badArgs(store) {
    var assertPromise = (promiseFunc, errMessage) => new Promise((resolve, reject) => {
        try { promiseFunc().then(() => reject(errMessage)) }
        catch (error) { resolve('expected error') }
    });

    return Promise.all([
        assertPromise(
            () => store.logActivity(null),
            'logActivity should have thrown error about missing activity'
        ),
        assertPromise(
            () => store.getTranscriptActivities(null, null),
            'getTranscriptActivities should have thrown error about missing channelId'
        ),
        assertPromise(
            () => store.getTranscriptActivities('foo', null),
            'getTranscriptActivities should have thrown error about missing conversationId'
        ),
        assertPromise(
            () => store.listTranscripts(null),
            'listTranscripts should have thrown error about missing channelId'
        ),
        assertPromise(
            () => store.deleteTranscript(null, null),
            'deleteTranscript should have thrown error about missing channelId'
        ),
        assertPromise(
            () => store.deleteTranscript('foo', null),
            'deleteTranscript should have thrown error about missing conversationId'
        )
    ]);
}

exports._logActivity = function _logActivity(store) {
        var conversationId = '_logActivity';
        var date = new Date();
        var activity = createActivities(conversationId, date, 1).pop();

        return store.logActivity(activity)
            .then(() => store.getTranscriptActivities('test', conversationId))
            .then((result) => {
                assert.equal(result.items.length, 1);
                assert.equal(JSON.stringify(result.items[0]), JSON.stringify(activity));
            });
}

exports._logMultipleActivities = function _logMultipleActivities(store) {
    return new Promise((resolve, reject) => {
        reject('not implemented');
    });
}

exports._deleteTranscript = function _deleteTranscript(store) {
    return new Promise((resolve, reject) => {
        reject('not implemented');
    });
}

exports._getTranscriptActivities = function _getTranscriptActivities(store) {
    return new Promise((resolve, reject) => {
        reject('not implemented');
    });
}

exports._getTranscriptActivitiesStartDate = function _getTranscriptActivitiesStartDate(store) {
    return new Promise((resolve, reject) => {
        reject('not implemented');
    });
}

exports._listTranscripts = function _listTranscripts(store) {
    return new Promise((resolve, reject) => {
        reject('not implemented');
    });
}