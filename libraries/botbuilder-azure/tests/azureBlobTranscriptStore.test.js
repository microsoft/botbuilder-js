const assert = require('assert');
const { AzureBlobTranscriptStore } = require('../');
const azure = require('azure-storage');
const base = require('../../botbuilder/tests/transcriptStoreBaseTest');
const { MockMode, usingNock } = require('./mockHelper');
const nock = require('nock');

const mode = process.env.MOCK_MODE || MockMode.lockdown;

const getSettings = (container = null) => ({
    storageAccountOrConnectionString: 'UseDevelopmentStorage=true;',
    containerName: container || 'test-transcript'
});

const noEmulatorMessage = 'skipping test because azure storage emulator is not running';
const settings = getSettings();
const useParallel = settings.storageAccountOrConnectionString !== 'UseDevelopmentStorage=true;';

const reset = (done) => {
    nock.cleanAll();
    nock.enableNetConnect();
    if ( mode !== MockMode.lockdown ) {
        let settings = getSettings();
        let client = azure.createBlobService(settings.storageAccountOrConnectionString, settings.storageAccessKey);
        client.deleteContainerIfExists(settings.containerName, (err, result) => done());
    } else {
        done();
    }
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

function getDataFromScopes(scopes) {
    let filteredScopes = scopes.filter(function(x) { return x.interceptors && x.interceptors.length > 0 && x.interceptors[0]._requestBody != '' });
    return filteredScopes.map(s => {
        let requestBody = s.interceptors[0]._requestBody;
        return {
            id: requestBody.id,
            timestamp: requestBody.timestamp
        }
    });
}

function createActivities(conversationId = '_conversationId', timestamp = new Date(), baseId = '1', amount = 1) {
    let activities = [];

    for (let i = 1; i <= amount; i++) {
        let tempActivities = base.createActivity(conversationId, timestamp, baseId, i);
        activities.push(tempActivities[0]);
        activities.push(tempActivities[1]);
    }

    return activities;
}

function fixActivities(activities, scopeData) {
    for (let i = 0; i < activities.length; i++) {
        let activity = activities[i];
        let scope = scopeData[i];

        activity.id = scope.id;
        activity.timestamp = new Date(scope.timestamp);
    }
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
        return usingNock(this.test, mode)
            .then(({nockDone, context}) => {
                let scopeData = getDataFromScopes(context.scopes)[0];

                let activity = null;

                if (scopeData) {
                    activity = createActivities('_logActivity', new Date(scopeData.timestamp), scopeData.id, 1).pop();
                }

                let storage = new AzureBlobTranscriptStore(settings);
                return base._logActivity(storage, activity)
                    .then(() => assert(true))
                    .catch(handleConnectionError)
                    .then(nockDone);
            });
    })

    it('log multiple activities', function () {
        return usingNock(this.test, mode)
            .then(({nockDone, context}) => {
                let scopeData = getDataFromScopes(context.scopes);
                let activities = createActivities('_logMultipleActivities', new Date(), 1, 5);

                if (activities.length === scopeData.length) {
                    fixActivities(activities, scopeData);
                } else {
                    activities = null;
                }

                let storage = new AzureBlobTranscriptStore(settings);
                return base._logMultipleActivities(storage, useParallel, activities)
                    .then(() => assert(true))
                    .catch(handleConnectionError)
                    .then(nockDone);
            });
    })

    it('delete transcript', function () {
        if (mode === MockMode.lockdown) {
            console.warn('Test is skipped because it does not work in \'lockdown\' mode. It will be fixed later')
            this.skip();
        }

        return usingNock(this.test, mode)
            .then(({nockDone, context}) => {
                let scopeData = getDataFromScopes(context.scopes);

                let firstConversation = createActivities('_deleteConversation', new Date(), 1, 1);
                let secondConversation = createActivities('_deleteConversation2', new Date(), 1, 1);

                if (scopeData.length === (firstConversation.length + secondConversation.length)) {
                    fixActivities(firstConversation, scopeData.slice(0, firstConversation.length));
                    fixActivities(secondConversation, scopeData.slice(secondConversation.length));
                } else {
                    firstConversation = null;
                    secondConversation = null;
                }

                let storage = new AzureBlobTranscriptStore(settings);
                return base._deleteTranscript(storage, useParallel, firstConversation, secondConversation)
                    .then(() => assert(true))
                    .catch(handleConnectionError)
                    .then(nockDone);
            });
    })

    it('get transcript activities', function () {
        return usingNock(this.test, mode)
            .then(({nockDone, context}) => {
                let scopeData = getDataFromScopes(context.scopes);

                let activities = createActivities('_getTranscriptActivitiesPaging', new Date(), 1, 50);

                if (activities.length === scopeData.length) {
                    fixActivities(activities, scopeData)
                } else {
                    activities = null;
                }

                let storage = new AzureBlobTranscriptStore(settings);
                return base._getTranscriptActivities(storage, useParallel, activities)
                    .then(() => assert(true))
                    .catch(handleConnectionError)
                    .then(nockDone);
            });
    })

    it('get transcript activities with startDate', function () {
        return usingNock(this.test, mode)
            .then(({nockDone, context}) => {
                let scopeData = getDataFromScopes(context.scopes);

                let activities = createActivities('_getTranscriptActivitiesStartDate', new Date(), 1, 50);

                if (activities.length === scopeData.length) {
                    fixActivities(activities, scopeData)
                } else {
                    activities = null;
                }
                
                let storage = new AzureBlobTranscriptStore(settings);
                return base._getTranscriptActivitiesStartDate(storage, useParallel, activities)
                    .then(() => assert(true))
                    .catch(handleConnectionError)
                    .then(nockDone);
            });
    })

    it('list transcripts', function () {
        return usingNock(this.test, mode)
            .then(({nockDone, context}) => {
                let scopeData = getDataFromScopes(context.scopes);

                var conversationIds = [];
                for (let i = 1; i <= 100; i++) {
                    conversationIds.push(`_ListConversations${i}`)
                }

                var activities = [].concat(...conversationIds.map(cId => createActivities(cId, new Date(), 1, 1)));

                if (activities.length === scopeData.length) {
                    fixActivities(activities, scopeData);
                } else {
                    activities = null;
                    conversationIds = null;
                }

                let storage = new AzureBlobTranscriptStore(settings);
                return base._listTranscripts(storage, useParallel, activities, conversationIds)
                    .then(() => assert(true))
                    .catch(handleConnectionError)
                    .then(nockDone);
            });
    })
}

describe('AzureBlobTranscriptStore', function () {
    this.timeout(20000);
    before('cleanup', reset);
    testStorage();
    after('cleanup', reset);
});
