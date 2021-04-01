// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const assert = require('assert');
const pmap = require('p-map');
const { BlobsTranscriptStore } = require('../');

const connectionString = process.env.AZURE_BLOB_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_BLOB_STORAGE_CONTAINER;

const maybeClient = () =>
    connectionString && containerName ? new BlobsTranscriptStore(connectionString, containerName) : null;

describe('BlobsStorage', function () {
    const client = maybeClient();
    const maybeIt = client ? it : it.skip;

    const activity = {
        channelId: 'channelId',
        conversation: { id: 'conversationId' },
        from: { id: 'fromId' },
        id: 'activityId',
        recipient: { id: 'recipientId' },
        timestamp: new Date(),
    };

    // Constructs a random channel ID and set of activities, and then handles preloading
    // and clearing them with beforeEach/afterEach IFF client is defined
    const maybePreload = () => {
        const rand = Math.floor(Math.random() * 10000000);
        const channelId = `${activity.channelId}-${rand}`;
        const conversationId = `${activity.conversation.id}-${rand}`;

        const activities = [1, 2, 3, 4, 5].map((n) => {
            const timestamp = new Date(activity.timestamp);
            timestamp.setHours(timestamp.getHours() + n);

            return {
                ...activity,
                channelId,
                conversation: {
                    ...activity.conversation,
                    id: conversationId,
                },
                id: `${activity.id}-${n}`,
                timestamp,
            };
        });

        if (client) {
            beforeEach(async function () {
                await pmap(activities, (activity) => client.logActivity(activity), { concurrency: 2 });
            });

            afterEach(async function () {
                await client.deleteTranscript(channelId, conversationId);
            });
        }

        return { activities, channelId, conversationId };
    };

    describe('constructor()', function () {
        it('throws for bad args', function () {
            assert.throws(() => new BlobsTranscriptStore(), 'throws for missing connectionString');
            assert.throws(() => new BlobsTranscriptStore('connectionString'), 'throws for missing containerName');
        });

        it('succeeds for good args', function () {
            new BlobsTranscriptStore('UseDevelopmentStorage=true;', 'container');
        });
    });

    describe('logActivity()', function () {
        maybeIt('should throw for bad arguments', async () => {
            await assert.rejects(() => client.logActivity());
        });

        maybeIt('should log an activity', async () => {
            await client.logActivity(activity);
        });
    });

    describe('getTranscriptActivites', function () {
        const { activities, channelId, conversationId } = maybePreload();

        maybeIt('should throw for bad arguments', async () => {
            await assert.rejects(() => client.getTranscriptActivities());
            await assert.rejects(() => client.getTranscriptActivities('channelId'));
        });

        maybeIt('should return all logged activities', async () => {
            const result = await client.getTranscriptActivities(channelId, conversationId);
            assert.deepStrictEqual(result.items, activities);
        });

        maybeIt('should return activities older than startDate', async () => {
            const [, , ...rest] = activities;
            const result = await client.getTranscriptActivities(
                channelId,
                conversationId,
                undefined,
                rest[0].timestamp
            );
            assert.deepStrictEqual(result.items, rest);
        });

        maybeIt('should return no activities', async () => {
            const startDate = new Date();
            startDate.setHours(startDate.getHours() + 24);

            const result = await client.getTranscriptActivities(channelId, conversationId, undefined, startDate);
            assert.deepStrictEqual(result.items, []);
        });
    });

    describe('deleteTranscript()', function () {
        const { channelId, conversationId } = maybePreload();

        maybeIt('should throw for bad arguments', async () => {
            await assert.rejects(() => client.deleteTranscript());
            await assert.rejects(() => client.deleteTranscript('channelId'));
        });

        maybeIt('should delete all activities', async () => {
            await client.deleteTranscript(channelId, conversationId);
            const result = await client.listTranscripts(channelId);
            assert.deepStrictEqual(result.items, []);
        });
    });

    describe('listTranscripts()', function () {
        const { activities, channelId } = maybePreload();

        maybeIt('should throw for bad arguments', async () => {
            await assert.rejects(() => client.listTranscripts());
        });

        maybeIt('should list all transcripts', async () => {
            const result = await client.listTranscripts(channelId);
            assert.deepStrictEqual(
                result.items,
                activities.map(({ channelId, conversation: { id }, timestamp: created }) => ({
                    channelId,
                    id,
                    created,
                }))
            );
        });
    });
});
