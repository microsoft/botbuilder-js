const assert = require('assert');
const { AzureBlobTranscriptStore } = require('../');
const azure = require('@azure/storage-blob');
const sinon = require('sinon');

const pageSize = 20;

const getSettings = (container = null) => ({
    storageAccountOrConnectionString: 'UseDevelopmentStorage=true;',
    containerName: container || 'test-transcript',
    storageAccount: 'myAccount',
    storageAccessKey: '*(^&%*',
    host: 'none',
});

const activity = {
    channelId: 'channelId',
    conversation: { id: 'conversationId' },
    from: { id: 'fromId' },
    id: 'activityId',
    recipient: { id: 'recipientId' },
    timestamp: new Date(),
};
const rand = () => Math.floor(Math.random() * 10000000);
const channelId = `${activity.channelId}-${rand()}`;
const conversationId = `${activity.conversation.id}-${rand()}`;

const activities = [1, 2].map((n) => {
    const timestamp = activity.timestamp;
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

const { BlobClient, BlockBlobClient, ContainerClient } = azure;
describe('The AzureBlobTranscriptStore', function () {
    let storage;
    let sandbox;
    let mockBlock;
    let mockBlobClient;
    let mockContainer;
    let pagedAsyncIterableIterator;
    beforeEach(function () {
        sandbox = sinon.createSandbox();

        pagedAsyncIterableIterator = {
            byPage: sinon.stub().returns({
                next: sinon
                    .stub()
                    .onFirstCall()
                    .returns({
                        value: {
                            segment: {
                                blobItems: [
                                    {
                                        name: `blob1/${conversationId}`,
                                        properties: { createdOn: 1546214400000 },
                                    },
                                ],
                            },
                        },
                        done: false,
                    })
                    .onSecondCall()
                    .returns({
                        value: {
                            segment: {
                                blobItems: [
                                    {
                                        name: `blob2/${conversationId}`,
                                        properties: { createdOn: 1546214400000 },
                                    },
                                ],
                            },
                        },
                        done: false,
                    })
                    .onThirdCall()
                    .returns({
                        value: {},
                        done: true,
                    }),
            }),
        };

        mockBlock = sandbox.createStubInstance(BlockBlobClient);
        mockBlock.upload = sandbox.stub().resolves();

        mockBlobClient = sandbox.createStubInstance(BlobClient);
        mockBlobClient.download = sandbox
            .stub()
            .onFirstCall()
            .resolves(generateStreamedContent(activities[0]))
            .onSecondCall()
            .resolves(generateStreamedContent(activities[1]));

        mockContainer = sandbox.createStubInstance(ContainerClient);
        mockContainer.getBlockBlobClient = sandbox.stub().returns(mockBlock);
        mockContainer.listBlobsByHierarchy = sandbox.stub().returns(pagedAsyncIterableIterator);
        mockContainer.deleteBlob = sandbox.stub().resolves();
        mockContainer.getBlobClient = sandbox.stub().returns(mockBlobClient);

        storage = new AzureBlobTranscriptStore(getSettings());
        storage.containerClient = mockContainer;
    });
    after(function () {
        // reset mock
        sandbox.restore();
    });

    describe('should throw when', function () {
        it('is constructed with null settings', function () {
            assert.throws(() => new AzureBlobTranscriptStore(null), Error('The settings parameter is required.'));
        });

        it('it is constructed with no container name', function () {
            assert.throws(() => new AzureBlobTranscriptStore({}), Error('The containerName is required.'));
        });

        it('it is constructed with an invalid container name', function () {
            assert.throws(
                () => new AzureBlobTranscriptStore({ containerName: '$%^$@' }),
                new Error('Invalid container name.')
            );
        });

        it('it is constructed without the storageAccountOrConnectionString in the settings', function () {
            assert.throws(
                () => new AzureBlobTranscriptStore({ ...getSettings(), storageAccountOrConnectionString: '' }),
                new Error('The storageAccountOrConnectionString is required.')
            );
        });

        it('no activity is passed to the "logActivity" function', async function () {
            await assert.rejects(storage.logActivity(null), Error('Missing activity.'));
        });

        it('no channelId is passed to the "getTranscriptActivities" function', async function () {
            await assert.rejects(storage.getTranscriptActivities(null, '123456'), Error('Missing channelId'));
        });

        it('no conversationId is passed to the "getTranscriptActivities" function', async function () {
            await assert.rejects(storage.getTranscriptActivities({}), Error('Missing conversationId'));
        });

        it('no channelId is passed to the "listTranscripts" function', async function () {
            await assert.rejects(storage.listTranscripts(), Error('Missing channelId'));
        });

        it('no channelId is passed to the "deleteTranscript" function', async function () {
            await assert.rejects(storage.deleteTranscript(), Error('Missing channelId'));
        });

        it('no conversationId is passed to the "deleteTranscript" function', async function () {
            await assert.rejects(storage.deleteTranscript({}), Error('Missing conversationId'));
        });
    });

    it('should log an activity', async function () {
        await storage.logActivity(activity);

        sinon.assert.calledOnce(mockContainer.getBlockBlobClient);
        sinon.assert.calledOnce(mockBlock.upload);
    });

    it('should delete a transcript', async function () {
        await storage.deleteTranscript('deleteTranscript', '1234');

        sinon.assert.calledOnceWithExactly(mockContainer.listBlobsByHierarchy, '/', {
            prefix: 'deleteTranscript/1234/',
            includeMetadata: true,
        });
        sinon.assert.calledOnceWithExactly(pagedAsyncIterableIterator.byPage, { maxPageSize: pageSize });
        sinon.assert.calledTwice(mockContainer.deleteBlob);
    });

    it('get transcript activities', async function () {
        const result = await storage.getTranscriptActivities('getTranscriptActivities', '1234', null, this.timestamp);
        sinon.assert.calledOnceWithExactly(mockContainer.listBlobsByHierarchy, '/', {
            prefix: 'getTranscriptActivities/1234/',
        });
        sinon.assert.calledOnceWithExactly(pagedAsyncIterableIterator.byPage, {
            continuationToken: null,
            maxPageSize: pageSize,
        });
        sinon.assert.calledTwice(mockBlobClient.download);
        assert.deepStrictEqual(result.items, activities);
    });

    it('should list transcripts', async function () {
        const result = await storage.listTranscripts(channelId);

        sinon.assert.calledOnceWithExactly(mockContainer.listBlobsByHierarchy, '/', {
            prefix: `${channelId}/`,
        });
        sinon.assert.calledOnceWithExactly(pagedAsyncIterableIterator.byPage, {
            continuationToken: undefined,
            maxPageSize: pageSize,
        });
        const actual = result.items.map((item) => {
            return {
                channelId: item.channelId,
                id: item.id,
            };
        });
        const expected = activities.map((activity) => ({
            channelId: activity.channelId,
            id: activity.conversation.id,
        }));
        assert.deepStrictEqual(actual, expected);
    });
});

function generateStreamedContent(data) {
    const stream = require('stream');
    const Readable = stream.Readable;

    const streamReadable = new Readable();
    streamReadable._read = () => {};
    streamReadable.push(JSON.stringify(data));
    streamReadable.push(null);

    return {
        readableStreamBody: streamReadable,
    };
}
