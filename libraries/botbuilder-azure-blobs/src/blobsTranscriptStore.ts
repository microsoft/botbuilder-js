// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import getStream from 'get-stream';
import pmap from 'p-map';
import { Activity, PagedResult, TranscriptInfo, TranscriptStore, assertActivity } from 'botbuilder-core';
import { assert } from 'botbuilder-stdlib';
import { maybeCast } from 'botbuilder-stdlib/lib/maybeCast';
import { sanitizeBlobKey } from './sanitizeBlobKey';

import {
    ContainerClient,
    ContainerListBlobHierarchySegmentResponse,
    StoragePipelineOptions,
} from '@azure/storage-blob';

// Formats a timestamp in a way that is consistent with the C# SDK
function formatTicks(timestamp: Date): string {
    const epochTicks = 621355968000000000; // the number of .net ticks at the unix epoch
    const ticksPerMillisecond = 10000; // there are 10000 .net ticks per millisecond
    const ticks = epochTicks + timestamp.getTime() * ticksPerMillisecond;
    return ticks.toString(16);
}

// Formats a channelId as a blob prefix
function getChannelPrefix(channelId: string): string {
    return sanitizeBlobKey(`${channelId}/`);
}

// Formats a channelId and conversationId as a blob prefix
function getConversationPrefix(channelId: string, conversationId: string): string {
    return sanitizeBlobKey(`${channelId}/${conversationId}`);
}

// Formats an activity as a blob key
function getBlobKey(activity: Activity): string {
    return sanitizeBlobKey(
        [activity.channelId, activity.conversation.id, `${formatTicks(activity.timestamp)}-${activity.id}.json`].join(
            '/'
        )
    );
}

// Max number of results returned in a single Azure API call
const MAX_PAGE_SIZE = 20;

/**
 * Optional settings for BlobsTranscriptStore
 */
export interface BlobsTranscriptStoreOptions {
    /**
     * [StoragePipelineOptions](xref:@azure/storage-blob.StoragePipelineOptions) to pass to azure blob
     * storage client
     */
    storagePipelineOptions?: StoragePipelineOptions;
}

/**
 * BlobsTranscriptStore is a [TranscriptStore](xref:botbuilder-core.TranscriptStore) that persists
 * transcripts in Azure Blob Storage
 *
 * @summary
 * Each activity is stored as JSON blob with a key of
 * `container/{channelId]/{conversationId}/{Timestamp.ticks}-{activity.id}.json`.
 */
export class BlobsTranscriptStore implements TranscriptStore {
    private readonly _containerClient: ContainerClient;
    private readonly _concurrency = Infinity;
    private _initializePromise: Promise<unknown>;

    /**
     * Constructs a BlobsStorage instance.
     *
     * @param {string} connectionString Azure Blob Storage connection string
     * @param {string} containerName Azure Blob Storage container name
     * @param {BlobsTranscriptStoreOptions} options Other options for BlobsTranscriptStore
     */
    constructor(connectionString: string, containerName: string, options?: BlobsTranscriptStoreOptions) {
        assert.string(connectionString, ['connectionString']);
        assert.string(containerName, ['containerName']);

        this._containerClient = new ContainerClient(connectionString, containerName, options?.storagePipelineOptions);

        // At most one promise at a time to be friendly to local emulator users
        if (connectionString.trim() === 'UseDevelopmentStorage=true;') {
            this._concurrency = 1;
        }
    }

    private _initialize(): Promise<unknown> {
        if (!this._initializePromise) {
            this._initializePromise = this._containerClient.createIfNotExists();
        }
        return this._initializePromise;
    }

    /**
     * Get activities for a conversation (aka the transcript).
     *
     * @param {string} channelId channelId
     * @param {string} conversationId conversationId
     * @param {string} continuationToken continuation token to page through results
     * @param {Date} startDate earliest time to include in results
     * @returns {Promise<PagedResult<Activity>>} Promise that resolves to a
     * [PagedResult](xref:botbuilder-core.PagedResult) of [Activity](xref:botbuilder-core.Activity) items
     */
    async getTranscriptActivities(
        channelId: string,
        conversationId: string,
        continuationToken?: string,
        startDate?: Date
    ): Promise<PagedResult<Activity>> {
        assert.string(channelId, ['channelId']);
        assert.string(conversationId, ['conversationId']);

        await this._initialize();

        const iter = this._containerClient
            .listBlobsByHierarchy('/', {
                prefix: getConversationPrefix(channelId, conversationId),
            })
            .byPage({ continuationToken, maxPageSize: MAX_PAGE_SIZE });

        let page = await iter.next();
        while (!page.done) {
            // Note: azure library does not properly type iterator result, hence the need to cast
            const response = maybeCast<ContainerListBlobHierarchySegmentResponse>(page?.value ?? {});
            const blobItems = response?.segment?.blobItems ?? [];

            // Locate first index of results to slice from. If we have a start date, we want to return
            // activities after that start date. Otherwise we can simply return all activities in this page.
            const fromIdx =
                startDate != null
                    ? blobItems.findIndex((blobItem) => new Date(blobItem.metadata.timestamp) >= startDate)
                    : 0;

            if (fromIdx !== -1) {
                return {
                    continuationToken: response?.continuationToken,
                    items: await pmap(
                        blobItems.slice(fromIdx),
                        async (blobItem) => {
                            const blob = await this._containerClient.getBlobClient(blobItem.name).download();
                            const { readableStreamBody: stream } = blob;
                            const contents = await getStream(stream);

                            const activity = JSON.parse(contents);
                            return { ...activity, timestamp: new Date(activity.timestamp) } as Activity;
                        },
                        { concurrency: this._concurrency }
                    ),
                };
            }

            page = await iter.next();
        }

        return { continuationToken: '', items: [] };
    }

    /**
     * List conversations in the channelId.
     *
     * @param {string} channelId channelId
     * @param {string} continuationToken continuation token to page through results
     * @returns {Promise<PagedResult<TranscriptInfo>>} Promise that resolves to a
     * [PagedResult](xref:botbuilder-core.PagedResult) of [Activity](xref:botbuilder-core.Activity) items
     */
    async listTranscripts(channelId: string, continuationToken?: string): Promise<PagedResult<TranscriptInfo>> {
        assert.string(channelId, ['channelId']);

        await this._initialize();

        const page = await this._containerClient
            .listBlobsByHierarchy('/', {
                prefix: getChannelPrefix(channelId),
            })
            .byPage({ continuationToken, maxPageSize: MAX_PAGE_SIZE })
            .next();

        // Note: azure library does not properly type iterator result, hence the need to cast
        const response = maybeCast<ContainerListBlobHierarchySegmentResponse>(page?.value ?? {});
        const blobItems = response?.segment?.blobItems ?? [];

        return {
            continuationToken: response?.continuationToken,
            items: blobItems.map((blobItem) => {
                const [, conversationId] = decodeURIComponent(blobItem.name).split('/');

                return {
                    channelId,
                    id: conversationId,
                    created: new Date(blobItem.metadata.timestamp),
                };
            }),
        };
    }

    /**
     * Delete a specific conversation and all of its activities.
     *
     * @param {string} channelId channelId
     * @param {string} conversationId conversationId
     * @returns {Promise<void>} A promise representing the async operation.
     */
    async deleteTranscript(channelId: string, conversationId: string): Promise<void> {
        assert.string(channelId, ['channelId']);
        assert.string(conversationId, ['conversationId']);

        await this._initialize();

        const iter = this._containerClient
            .listBlobsByHierarchy('/', {
                prefix: getConversationPrefix(channelId, conversationId),
            })
            .byPage({
                maxPageSize: MAX_PAGE_SIZE,
            });

        let page = await iter.next();
        while (!page.done) {
            // Note: azure library does not properly type iterator result, hence the need to cast
            const response = maybeCast<ContainerListBlobHierarchySegmentResponse>(page?.value ?? {});
            const blobItems = response?.segment?.blobItems ?? [];

            await pmap(blobItems, (blobItem) => this._containerClient.deleteBlob(blobItem.name), {
                concurrency: this._concurrency,
            });

            page = await iter.next();
        }
    }

    /**
     * Log an activity to the transcript.
     *
     * @param {Activity} activity activity to log
     * @returns {Promise<void>} A promise representing the async operation.
     */
    async logActivity(activity: Activity): Promise<void> {
        assertActivity(activity, ['activity']);

        await this._initialize();

        const blob = this._containerClient.getBlockBlobClient(getBlobKey(activity));
        const serialized = JSON.stringify(activity);

        await blob.upload(serialized, serialized.length, {
            metadata: {
                Id: activity.id,
                FromId: activity.from.id,
                RecipientId: activity.recipient.id,
                Timestamp: activity.timestamp.toJSON(),
            },
        });
    }
}
