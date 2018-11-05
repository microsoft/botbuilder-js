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

exports.createActivity = function createActivity(conversationId, timestamp, activityId, recipientNumber) {
    let activities = [];

    activities.push({
        type: ActivityTypes.Message,
        timestamp: timestamp,
        id: activityId,
        text: recipientNumber.toString(),
        channelId: 'test',
        from: { id: `User${recipientNumber}` },
        conversation: { id: conversationId },
        recipient: { id: 'Bot1', name: '2' },
        serviceUrl: 'http://foo.com/api/messages'
    });

    activities.push({
        type: ActivityTypes.Message,
        timestamp: timestamp,
        id: activityId,
        text: recipientNumber.toString(),
        channelId: 'test',
        from: { id: 'Bot1', name: '2' },
        conversation: { id: conversationId },
        recipient: { id: `User${recipientNumber}` },
        serviceUrl: 'http://foo.com/api/messages'
    });

    return activities;
}

function group(array, size) {
    return array.reduce((acc, x, i) => {
        if (i % size) {
            acc[acc.length - 1].push(x);
        } else {
            acc.push([x]);
        }
        return acc;
    }, []);
}

function promiseSeq(promiseFuncArray) {
    return promiseFuncArray.reduce((chain, promiseFunc) => {
        return chain.then(chainResult =>
            promiseFunc().then(currentResult =>
                [ ...chainResult, currentResult ]
            )
        );
    }, Promise.resolve([]));
}

function promiseParallel(promiseFuncArray) {
    return Promise.all(promiseFuncArray.map(promiseFunc => promiseFunc()));
}

function resolvePromises(promiseFuncArray, useParallel = true) {
    return useParallel ? promiseParallel(promiseFuncArray) : promiseSeq(promiseFuncArray);
}

function dateSorter(a, b) {
    return a.timestamp.getTime() - b.timestamp.getTime();
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

function logActivity(store) {
    var conversationId = '_logActivity';
    var date = new Date();
    var activity = createActivities(conversationId, date, 1).pop();

    return logWrappedActivity(store, activity);
}

function logWrappedActivity(store, activity) {
    return store.logActivity(activity)
        .then(() => store.getTranscriptActivities('test', activity.conversation.id))
        .then((result) => {
            assert.equal(result.items.length, 1);
            assert.equal(JSON.stringify(result.items[0]), JSON.stringify(activity));
        });
}

exports._logActivity = function _logActivity(store, activity) {
    if(activity) {
      return logWrappedActivity(store, activity);
    }
    return logActivity(store);
}

function logMultipleActivities(store, useParallel) {
    var conversationId = '_logMultipleActivities';
    var start = new Date();
    var activities = createActivities(conversationId, start);

    return logMultipleWrappedActivities(store, useParallel, activities);
}

function logMultipleWrappedActivities(store, useParallel, activities) {
    var conversationId = activities[0].conversation.id;
    var start = activities[0].timestamp;

    // log activities
    var writes = activities.map(a => () => store.logActivity(a));

    // wait for all logs
    return resolvePromises(writes, useParallel).then(() => {
        // group the different queries into promises
        return Promise.all([
            // make sure other channels and conversations don't return results
            store.getTranscriptActivities('bogus', conversationId).then(pagedResult => {
                assert(!pagedResult.continuationToken);
                assert.equal(pagedResult.items.length, 0);
            }),
            // make sure other channels and conversations don't return results
            store.getTranscriptActivities('test', 'bogus').then(pagedResult => {
                assert(!pagedResult.continuationToken);
                assert.equal(pagedResult.items.length, 0);
            }),
            // make sure all created activities where persisted
            store.getTranscriptActivities('test', conversationId).then(pagedResult => {
                assert(!pagedResult.continuationToken);
                assert.equal(pagedResult.items.length, activities.length);

                // assert all are equal
                assert.equal(
                    JSON.stringify(pagedResult.items.sort(dateSorter)),
                    JSON.stringify(activities)
                );
            }),
            // assert half page, get activities +5 minutes
            store.getTranscriptActivities('test', conversationId, null, new Date(start.getTime() + 60000 * 5)).then(pagedResult => {
                assert.equal(activities.length / 2, pagedResult.items.length);
                var expected = activities.slice(5);
                assert.equal(
                    JSON.stringify(pagedResult.items.sort(dateSorter)),
                    JSON.stringify(expected));
            })
        ]);
    });
}

exports._logMultipleActivities = function _logMultipleActivities(store, useParallel = true, activities = null) {
    if (activities) {
        return logMultipleWrappedActivities(store, useParallel, activities);
    } else {
        return logMultipleActivities(store, useParallel);
    }
}

function deleteTranscript(store, useParallel) {
    var firstConversationId = '_deleteConversation';
    var secondConversationId = '_deleteConversation2';
    var start = new Date();
    var firstActivities = createActivities(firstConversationId, start, 1);
    var secondActivities = createActivities(secondConversationId, start, 1);

    return deleteTranscriptWithActivities(store, useParallel, firstActivities, secondActivities);
}

function deleteTranscriptWithActivities(store, useParallel, firstActivities, secondActivities) {
    var firstConversationId = firstActivities[0].conversation.id;
    var secondConversationId = secondActivities[0].conversation.id;
    // log all activities
    var writes = firstActivities.concat(secondActivities)
        .map(a => () => store.logActivity(a));

    // wait for all writes
    return resolvePromises(writes, useParallel).then(() => {
        return Promise.all([
            // test A
            store.getTranscriptActivities('test', firstConversationId).then(pagedResult => {
                assert.equal(pagedResult.items.length, firstActivities.length);
                // delete!
                store.deleteTranscript('test', firstConversationId).then(() => {
                    return Promise.all([
                        // check deleted
                        store.getTranscriptActivities('test', firstConversationId).then(pagedResult => {
                            assert.equal(pagedResult.items.length, 0);
                        }),
                        // check second transcript still exists
                        store.getTranscriptActivities('test', secondConversationId).then(pagedResult => {
                            assert.equal(pagedResult.items.length, secondActivities.length);
                        })
                    ])
                })
            }),
            // test B
            store.getTranscriptActivities('test', secondConversationId).then(pagedResult => {
                assert.equal(pagedResult.items.length, secondActivities.length);
            })
        ])
    });
}

exports._deleteTranscript = function _deleteTranscript(store, useParallel = true, firstActivities = null, secondActivities = null) {
    if (firstActivities && secondActivities) {
        return deleteTranscriptWithActivities(store, useParallel, firstActivities, secondActivities)
    }
    return deleteTranscript(store, useParallel);
}

function getTranscriptActivities(store, useParallel) {
    var conversationId = '_getTranscriptActivitiesPaging';
    var date = new Date();
    var activities = createActivities(conversationId, date, 50);

    return getTranscriptWrappedActivities(store, useParallel, activities);
}

function getTranscriptWrappedActivities(store, useParallel, activities) {
    return new Promise((resolve, reject) => {
        var conversationId = activities[0].conversation.id;
        // log in parallel batches of 10
        var groups = group(activities, 10);
        return promiseSeq(groups.map(group => () => resolvePromises(group.map(item => () => store.logActivity(item)), useParallel)))
        .then(async () => {
            var actualPageSize = 0;
            var pagedResult = {};
            var seen = [];
            do {
                pagedResult = await store.getTranscriptActivities('test', conversationId, pagedResult.continuationToken);
                assert(pagedResult);
                assert(pagedResult.items);

                if (!actualPageSize) {
                    actualPageSize = pagedResult.items.length;
                } else if (actualPageSize === pagedResult.items.length) {
                    assert(pagedResult.continuationToken)
                }
                pagedResult.items.forEach(item => {
                    assert(!seen.includes(item.id));
                    seen.push(item.id);
                });
            } while (pagedResult.continuationToken);
            assert.equal(seen.length, activities.length);
            activities.forEach(activity => assert(seen.includes(activity.id)));
            resolve();
        }).catch(error => reject(error));
    });
}

exports._getTranscriptActivities = function _getTranscriptActivities(store, useParallel = true, activities = null) {
    if (activities) {
        return getTranscriptWrappedActivities(store, useParallel, activities);
    }
    return getTranscriptActivities(store, useParallel);
}

function getTranscriptActivitiesStartDate(store, useParallel) {
    var conversationId = '_getTranscriptActivitiesStartDate';
    var date = new Date();
    var activities = createActivities(conversationId, date, 50);

    return getTranscriptWrappedActivitiesStartDate(store, useParallel, activities);
}

function getTranscriptWrappedActivitiesStartDate(store, useParallel, activities) {
    return new Promise((resolve, reject) => {
        var conversationId = activities[0].conversation.id;
        var date = activities[0].timestamp;
        
        // log in parallel batches of 10
        var groups = group(activities, 10);
        return promiseSeq(groups.map(group => () => resolvePromises(group.map(item => () => store.logActivity(item)), useParallel)))
        .then(async () => {
            var actualPageSize = 0;
            var pagedResult = {};
            var seen = [];
            var referenceDate = new Date(date.getTime() + (50 * 60 * 1000));
            do {
                pagedResult = await store.getTranscriptActivities('test', conversationId, pagedResult.continuationToken, referenceDate);
                assert(pagedResult);
                assert(pagedResult.items);

                if (!actualPageSize) {
                    actualPageSize = pagedResult.items.length;
                } else if (actualPageSize === pagedResult.items.length) {
                    assert(pagedResult.continuationToken)
                }
                pagedResult.items.forEach(item => {
                    assert(!seen.includes(item.id));
                    seen.push(item.id);
                });
            } while (pagedResult.continuationToken);
            assert.equal(seen.length, activities.length / 2);
            activities.filter(a => a.timestamp.getTime() >= referenceDate.getTime()).forEach(activity => assert(seen.includes(activity.id)));
            activities.filter(a => a.timestamp.getTime() < referenceDate.getTime()).forEach(activity => assert(!seen.includes(activity.id)));
            resolve();
        }).catch(error => reject(error));
    });
}

exports._getTranscriptActivitiesStartDate = function _getTranscriptActivitiesStartDate(store, useParallel = true, activities = null) {
    if (activities) {
        return getTranscriptWrappedActivitiesStartDate(store, useParallel, activities);
    }
    return getTranscriptActivitiesStartDate(store, useParallel);
}

function listTranscripts(store, useParallel) {
    var conversationIds = [];
    var start = new Date();
    for (let i = 1; i <= 100; i++) {
        conversationIds.push(`_ListConversations${i}`)
    }

    var activities = [].concat(...conversationIds.map(cId => createActivities(cId, start, 1)));

    return listTranscriptsWrappedActivities(store, useParallel, activities, conversationIds);
}

function listTranscriptsWrappedActivities(store, useParallel, activities, conversationIds) {
    return new Promise((resolve, reject) => {
        // log in parallel batches of 10
        var groups = group(activities, 10);
        return promiseSeq(groups.map(group => () => resolvePromises(group.map(item => () => store.logActivity(item)), useParallel)))
        .then(async () => {
            var actualPageSize = 0;
            var pagedResult = {};
            var seen = [];
            do {
                pagedResult = await store.listTranscripts('test', pagedResult.continuationToken);
                assert(pagedResult);
                assert(pagedResult.items);

                if (!actualPageSize) {
                    actualPageSize = pagedResult.items.length;
                } else if (actualPageSize === pagedResult.items.length) {
                    assert(pagedResult.continuationToken)
                }
                pagedResult.items.forEach(item => {
                    assert(!seen.includes(item.id));
                    if (item.id.startsWith('_ListConversations')) {
                        seen.push(item.id);
                    }
                });
            } while (pagedResult.continuationToken);
            assert.equal(seen.length, conversationIds.length);
            conversationIds.forEach(cId => assert(seen.includes(cId)));
            resolve();
        }).catch(error => reject(error));
    });
}

exports._listTranscripts = function _listTranscripts(store, useParallel = true, activities = null, conversationIds = null) {
    if (activities && conversationIds) {
        return listTranscriptsWrappedActivities(store, useParallel, activities, conversationIds)
    }
    return listTranscripts(store, useParallel);
}
