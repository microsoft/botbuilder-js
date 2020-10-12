/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import getStream from 'get-stream';
import pmap from 'p-map';
import { Activity, PagedResult, TranscriptInfo, TranscriptStore } from 'botbuilder';
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

function getChannelPrefix(channelId: string): string {
    return sanitizeBlobKey(`${channelId}/`);
}

function getConversationPrefix(channelId: string, conversationId: string): string {
    return sanitizeBlobKey(`${channelId}/${conversationId}`);
}

// Transforms an activity into its blob name
function getBlobName(activity: Activity): string {
    return sanitizeBlobKey(
        [activity.channelId, activity.conversation.id, `${formatTicks(activity.timestamp)}-${activity.id}.json`].join(
            '/'
        )
    );
}

/**
 * @remarks
 * Each activity is stored as JSON blob with a structure of
 * `container/{channelId]/{conversationId}/{Timestamp.ticks}-{activity.id}.json`.
 */
export class BlobsTranscriptStore implements TranscriptStore {
    private readonly _containerClient: ContainerClient;
    private readonly _concurrency: number;
    private _maxPageSize = 20;
    private _initializePromise: Promise<unknown>;

    /**
     * Constructs a BlobsStorage instance.
     *
     * @param connectionString Azure Blob Storage connection string
     * @param containerName Azure Blob Storage container name
     * @param options Azure Blob Storage [StoragePipelineOptions](xref:@azure/storage-blob.StoragePipelineOptions) options
     */
    constructor(connectionString: string, containerName: string, options?: StoragePipelineOptions) {
        if (typeof connectionString !== 'string') {
            throw new Error('`connectionString` is required and must be a string');
        }

        if (typeof containerName !== 'string') {
            throw new Error('`containerName` is required and must be a string');
        }

        this._containerClient = new ContainerClient(connectionString, containerName, options);

        // At most one promise at a time to be friendly to local emulator users
        this._concurrency = connectionString.trim() === 'UseDevelopmentStorage=true;' ? 1 : Infinity;
    }

    /**
     * Returns a promise that resolves when the container is accessible
     * @private
     */
    private _initialize(): Promise<unknown> {
        if (!this._initializePromise) {
            this._initializePromise = this._containerClient.createIfNotExists();
        }
        return this._initializePromise;
    }

    async getTranscriptActivities(
        channelId: string,
        conversationId: string,
        continuationToken?: string,
        startDate?: Date
    ): Promise<PagedResult<Activity>> {
        if (typeof channelId !== 'string') {
            throw new Error('`channelId` is required to be a string');
        }

        if (typeof conversationId !== 'string') {
            throw new Error('`conversationId` is required to be a string');
        }

        await this._initialize();

        const iter = this._containerClient
            .listBlobsByHierarchy('/', {
                prefix: getConversationPrefix(channelId, conversationId),
            })
            .byPage({ continuationToken, maxPageSize: this._maxPageSize });

        let page = await iter.next();
        while (!page.done) {
            const response = page?.value as ContainerListBlobHierarchySegmentResponse;
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

    async listTranscripts(channelId: string, continuationToken?: string): Promise<PagedResult<TranscriptInfo>> {
        if (typeof channelId !== 'string') {
            throw new Error('`channelId` is required to be a string');
        }

        await this._initialize();

        const page = await this._containerClient
            .listBlobsByHierarchy('/', {
                prefix: getChannelPrefix(channelId),
            })
            .byPage({ continuationToken, maxPageSize: this._maxPageSize })
            .next();

        const response = page?.value as ContainerListBlobHierarchySegmentResponse;
        const blobItems = response?.segment?.blobItems ?? [];

        return {
            continuationToken: response?.continuationToken,
            items: blobItems.map((blobItem) => {
                const [_, conversationId] = decodeURIComponent(blobItem.name).split('/');

                return {
                    channelId,
                    id: conversationId,
                    created: new Date(blobItem.metadata.timestamp),
                };
            }),
        };
    }

    async deleteTranscript(channelId: string, conversationId: string): Promise<void> {
        if (typeof channelId !== 'string') {
            throw new Error('`channelId` is required to be a string');
        }

        if (typeof conversationId !== 'string') {
            throw new Error('`conversationId` is required to be a string');
        }

        await this._initialize();

        const iter = this._containerClient
            .listBlobsByHierarchy('/', {
                prefix: getConversationPrefix(channelId, conversationId),
            })
            .byPage({
                maxPageSize: this._maxPageSize,
            });

        let page = await iter.next();
        while (!page.done) {
            const response = page?.value as ContainerListBlobHierarchySegmentResponse;
            const blobItems = response?.segment?.blobItems ?? [];

            await pmap(blobItems, (blobItem) => this._containerClient.deleteBlob(blobItem.name), {
                concurrency: this._concurrency,
            });

            page = await iter.next();
        }
    }

    async logActivity(activity: Activity): Promise<void> {
        if (typeof activity !== 'object') {
            throw new Error('`activity` is required to be a string');
        }

        await this._initialize();

        const blob = this._containerClient.getBlockBlobClient(getBlobName(activity));
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
