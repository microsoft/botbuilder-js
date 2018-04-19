const assert = require('assert');
const { ActivityTypes } = require('botbuilder-core');

function uuid() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    )
}

function createActivities(conversationId, ts, count = 5) {
    var activities = [];
    for (let i = 0; i <= count; i++) {
        activities.push({
            type: ActivityTypes.Message,
            timestamp: ts,
            id: uuid(),
            text: i.toString(),
            channelId: 'test',
            from: { id: `User${i}` },
            conversation: { id: conversationId },
            recipient: { id: 'Bot1', name: '2' },
            ServiceUrl: 'http://foo.com/api/messages'
        });
        ts.setMinutes(ts.getMinutes() + 1);

        activities.push({
            type: ActivityTypes.Message,
            timestamp: ts,
            id: uuid(),
            text: i.toString(),
            channelId: 'test',
            from: { id: 'Bot1', name: '2' },
            conversation: { id: conversationId },
            recipient: { id: `User${i}` },
            ServiceUrl: 'http://foo.com/api/messages'
        });
        ts.setMinutes(ts.getMinutes() + 1);
    }
    return activities;
}

exports._badArgs = function _badArgs(store) {
    return new Promise((resolve, reject) => {
        reject('not implemented');
    });
}

exports._logActivity =  function _logActivity(store) {
    return new Promise((resolve, reject) => {
        reject('not implemented');
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