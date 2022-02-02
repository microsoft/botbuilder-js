const { FileTranscriptStore } = require('../');

const assert = require('assert');
const path = require('path');
const os = require('os');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const { ActivityTypes } = require('botbuilder-core');

const workingFolder = path.join(os.tmpdir(), 'botbuilder-transcript-tests');

describe('The FileTranscriptStore', function () {
    let storage;
    const startDate = new Date();
    before(async function () {
        await fs.remove(workingFolder);
        storage = new FileTranscriptStore(workingFolder);
    });
    after(function () {
        return fs.remove(workingFolder);
    });

    it('should delete transcripts', async function () {
        const [activity] = createActivities('deleteActivitySpec', startDate, 1);
        await storage.logActivity(activity);

        let pagedResult = await storage.getTranscriptActivities('test', 'deleteActivitySpec');
        assert.ok(
            pagedResult.items.length === 1,
            `Expected pagedResult.items.length to be 1 but it was ${pagedResult.items.length}`
        );

        await storage.deleteTranscript('test', 'deleteActivitySpec');
        pagedResult = await storage.getTranscriptActivities('test', 'deleteActivitySpec');
        assert.ok(
            pagedResult.items.length === 0,
            `Expected pagedResult.items.length to be 0 but it was ${pagedResult.items.length}`
        );
    });

    it('should not delete transcripts for other conversations', async function () {
        const [activity] = createActivities('deleteActivitySpec', startDate, 1);
        await storage.logActivity(activity);

        await storage.deleteTranscript('test1', 'deleteActivitySpec');
        const pagedResult = await storage.getTranscriptActivities('test', 'deleteActivitySpec');
        assert.ok(
            pagedResult.items.length === 1,
            `Expected pagedResult.items.length to be 1 but it was ${pagedResult.items.length}`
        );
    });

    describe('should log activities', function () {
        const conversationId = 'logActivitySpec';
        let activities;
        before(function () {
            activities = createActivities(conversationId, startDate);
            return Promise.all(activities.map((activity) => storage.logActivity(activity)));
        });

        it('and report the proper length for the logged activities', async function () {
            const pagedResult = await storage.getTranscriptActivities('test', conversationId);
            assert.ok(pagedResult.items.length === 10, 'The logged activities has an unexpected length');
        });

        it('and retrieve the expected activity', async function () {
            const pagedResult = await storage.getTranscriptActivities('test', conversationId);
            assert.ok(JSON.stringify(pagedResult.items[0]), JSON.stringify(activities[0]));
        });

        it('and not retrieve activities for other channels', async function () {
            const pagedResult = await storage.getTranscriptActivities('otherChannelId', conversationId);
            assert.ok(
                !pagedResult.continuationToken,
                'expected pagedResult.continuationToken to be false but it was not'
            );
            assert.ok(pagedResult.items.length === 0, 'Expected pagedResult.items.length to be 0 but it was not');
        });

        it('and not retrieve activities for other conversations', async function () {
            const pagedResult = await storage.getTranscriptActivities('test', 'someOtherConversation');
            assert.ok(
                !pagedResult.continuationToken,
                'expected pagedResult.continuationToken to be false but it was not'
            );
            assert.ok(pagedResult.items.length === 0, 'Expected pagedResult.items.length to be 0 but it was not');
        });

        it('and persist them to disk', async function () {
            const pagedResult = await storage.getTranscriptActivities('test', conversationId);
            assert.ok(pagedResult.items.length === 10, 'Expected pagedResult.items.length to be 0 but it was not');
            pagedResult.items.forEach((item, index) =>
                assert.ok(
                    JSON.stringify(item) === JSON.stringify(activities[index]),
                    `item #${index} does not match what was persisted to disk`
                )
            );
        });

        it('and retrieve them by date', async function () {
            const pagedResult = await storage.getTranscriptActivities(
                'test',
                conversationId,
                null,
                new Date(startDate.getTime() + 60000 * 5)
            );
            assert.ok(
                pagedResult.items.length === 5,
                `Expected the pagedResult.items.length to be 5 but it was ${pagedResult.items.length}`
            );
        });
    });

    describe('should throw when', function () {
        it('is constructed without a root folder', function () {
            assert.throws(() => new FileTranscriptStore(null), Error('Missing folder.', 'An error should exist'));
        });

        it('no activity is passed to the "logActivity" function', async function () {
            await assert.rejects(
                storage.logActivity(null),
                new Error('activity cannot be null for logActivity()', 'An error should exist')
            );
        });

        it('no channelId is passed to the "getTranscriptActivities" function', async function () {
            await assert.rejects(
                storage.getTranscriptActivities(null, '123456'),
                new Error('Missing channelId', 'An error should exist')
            );
        });

        it('no conversationId is passed to the "getTranscriptActivities" function', async function () {
            await assert.rejects(
                storage.getTranscriptActivities({}),
                new Error('Missing conversationId', 'An error should exist')
            );
        });

        it('no channelId is passed to the "listTranscripts" function', async function () {
            await assert.rejects(storage.listTranscripts(), Error('Missing channelId', 'An error should exist'));
        });

        it('no channelId is passed to the "deleteTranscript" function', async function () {
            await assert.rejects(storage.deleteTranscript(), Error('Missing channelId', 'An error should exist'));
        });

        it('no conversationId is passed to the "deleteTranscript" function', async function () {
            await assert.rejects(
                storage.deleteTranscript({}),
                new Error('Missing conversationId', 'An error should exist')
            );
        });
    });

    describe('should retrieve activities', function () {
        const conversationId = 'retrieveActivitiesSpec';
        let activities;
        before(function () {
            activities = createActivities(conversationId, startDate, 60);
            storage = new FileTranscriptStore(workingFolder);
            return Promise.all(activities.map((activity) => storage.logActivity(activity)));
        });
        after(function () {
            return fs.remove(workingFolder);
        });

        it('with a continuationToken when the page size is smaller than the number of activities stored', async function () {
            const pagedResult = await storage.getTranscriptActivities('test', conversationId);
            assert.ok(
                typeof pagedResult.continuationToken === 'string',
                `Expected a continuationToken but got ${pagedResult.continuationToken}`
            );
            const pagedResult1 = await storage.getTranscriptActivities(
                'test',
                conversationId,
                pagedResult.continuationToken
            );
            assert.ok(!!pagedResult1.items.length, 'Expected the pagedResult to contain items but it did not');
            assert.ok(JSON.stringify(pagedResult) !== JSON.stringify(pagedResult1));
        });

        it('as expected when a startDate is provided', async function () {
            let pagedResult = {};
            let continuationToken;
            const seen = new Proxy(
                {},
                {
                    set(target, p, value) {
                        if (target[p]) {
                            assert.fail(
                                'This ID already returned by getTranscriptActivities and it should not have been'
                            );
                        }
                        return (target[p] = value);
                    },
                }
            );
            let increments = ~~(activities.length / 20);
            while (increments--) {
                const time = new Date(startDate.getTime() + increments * 60 * 1000);
                continuationToken = pagedResult.continuationToken;
                pagedResult = await storage.getTranscriptActivities('test', conversationId, continuationToken, time);
                pagedResult.items.forEach((item) => {
                    const timestamp = item.timestamp.getTime();
                    assert.ok(timestamp >= time.getTime());
                    seen[timestamp] = true;
                });
            }
        });

        it('and page through them as expected', async function () {
            let pagedResult = {};
            let i = activities.length / FileTranscriptStore.PageSize;
            let continuationToken;
            const seen = new Proxy(
                {},
                {
                    set(target, p, value) {
                        if (target[p]) {
                            assert.fail(
                                'This ID already returned by getTranscriptActivities and it should not have been'
                            );
                        }
                        return (target[p] = value);
                    },
                }
            );
            while (i--) {
                continuationToken = pagedResult.continuationToken;
                pagedResult = await storage.getTranscriptActivities('test', conversationId, continuationToken);
                assert.ok(
                    i === 0 || !!pagedResult.continuationToken,
                    'Expected a continuationToken but did not receive one'
                );
                assert.ok(
                    continuationToken !== pagedResult.continuationToken,
                    'The newly returned continuationToken should not match the last one received'
                );
                pagedResult.items.forEach((item) => (seen[item.id] = true));
            }
            assert.ok(!pagedResult.continuationToken, 'More continuationTokens exist but should not');
        });
    });

    describe('should list transcripts', function () {
        let activities;
        before(function () {
            activities = [];
            let ct = 100;
            while (ct--) {
                activities.push(...createActivities(uuidv4(), startDate, 1));
            }
            storage = new FileTranscriptStore(workingFolder);
            return Promise.all(activities.map((activity) => storage.logActivity(activity)));
        });
        after(function () {
            return fs.remove(workingFolder);
        });

        it('for a given conversation and page through them as expected', async function () {
            let pagedResult = {};
            let i = activities.length / FileTranscriptStore.PageSize / 2;
            let continuationToken;
            const seen = new Proxy(
                {},
                {
                    set(target, p, value) {
                        if (target[p]) {
                            assert.fail('This ID already returned by listTranscripts and it should not have been');
                        }
                        return (target[p] = value);
                    },
                }
            );
            while (i--) {
                continuationToken = pagedResult.continuationToken;
                pagedResult = await storage.listTranscripts('test', continuationToken);
                assert.ok(
                    i === 0 || !!pagedResult.continuationToken,
                    'Expected a continuationToken but did not receive one'
                );
                assert.ok(
                    continuationToken !== pagedResult.continuationToken,
                    'The newly returned continuationToken should not match the last one received'
                );
                pagedResult.items.forEach((item) => (seen[item.id] = true));
            }
            assert.ok(!pagedResult.continuationToken, 'More continuationTokens exist but should not');
        });
    });
});

function createActivities(conversationId, ts, count = 5) {
    const activities = [];
    for (let i = 0; i < count; i++) {
        activities.push({
            type: ActivityTypes.Message,
            timestamp: ts,
            id: uuidv4(),
            text: i.toString(),
            channelId: 'test',
            from: { id: `User${i}` },
            conversation: { id: conversationId },
            recipient: { id: 'Bot1', name: '2' },
            serviceUrl: 'http://foo.com/api/messages',
        });
        ts = new Date(ts.getTime() + 60000);

        activities.push({
            type: ActivityTypes.Message,
            timestamp: ts,
            id: uuidv4(),
            text: i.toString(),
            channelId: 'test',
            from: { id: 'Bot1', name: '2' },
            conversation: { id: conversationId },
            recipient: { id: `User${i}` },
            serviceUrl: 'http://foo.com/api/messages',
        });
        ts = new Date(ts.getTime() + 60000);
    }
    return activities;
}
