/**
 * @module botbuilder-azure
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {
    AnonymousCredential,
    ContainerClient,
    ContainerListBlobHierarchySegmentResponse,
    newPipeline,
    StorageRetryPolicyType,
} from '@azure/storage-blob';
import { Activity, PagedResult, TranscriptInfo, TranscriptStore } from 'botbuilder';
import { maybeCast } from 'botbuilder-stdlib';
import { escape } from 'querystring';
import getStream from 'get-stream';
import pmap from 'p-map';
import { BlobStorageSettings } from './blobStorage';

const ContainerNameCheck = new RegExp('^[a-z0-9](?!.*--)[a-z0-9-]{1,61}[a-z0-9]$');

/**
 * @private
 * Unique ket used to access the static <code>checkedCollections</code>
 * property of the AzureBlobTranscriptStore. Accessing it is necessary for
 * proper testing and debugging.
 */
export const checkedCollectionsKey = Symbol('checkedCollectionsKey');

/**
 * Stores transcripts in an Azure Blob container.
 *
 * @remarks
 * Each activity is stored as JSON blob with a structure of
 * `container/{channelId]/{conversationId}/{Timestamp.ticks}-{activity.id}.json`.
 *
 * @deprecated This class is deprecated in favor of [BlobsTranscriptStore](xref:botbuilder-azure-blobs.BlobsTranscriptStore)
 */
export class AzureBlobTranscriptStore implements TranscriptStore {
    /**
     * @private
     * Internal dictionary with the containers where entities will be stored.
     */
    private readonly settings: BlobStorageSettings;
    private containerClient: ContainerClient;
    private pageSize = 20;
    private readonly concurrency = Infinity;
    private initializePromise?: Promise<unknown>;

    /**
     * Creates a new AzureBlobTranscriptStore instance.
     *
     * @param settings Settings required for configuring an instance of BlobStorage
     */
    constructor(settings: BlobStorageSettings) {
        if (!settings) {
            throw new Error('The settings parameter is required.');
        }

        if (!settings.containerName) {
            throw new Error('The containerName is required.');
        }

        if (!this.checkContainerName(settings.containerName)) {
            throw new Error('Invalid container name.');
        }

        if (!settings.storageAccountOrConnectionString) {
            throw new Error('The storageAccountOrConnectionString is required.');
        }

        this.settings = { ...settings };
        const pipeline = newPipeline(new AnonymousCredential(), {
            retryOptions: {
                retryPolicyType: StorageRetryPolicyType.FIXED,
                maxTries: 5,
                retryDelayInMs: 500,
            }, // Retry options
        });

        this.containerClient = new ContainerClient(
            this.settings.storageAccountOrConnectionString,
            this.settings.containerName,
            pipeline.options
        );
    }

    private initialize(): Promise<unknown> {
        if (!this.initializePromise) {
            this.initializePromise = this.containerClient.createIfNotExists();
        }
        return this.initializePromise;
    }

    /**
     * Log an activity to the transcript.
     *
     * @param activity Activity being logged.
     */
    async logActivity(activity: Activity): Promise<void> {
        if (!activity) {
            throw new Error('Missing activity.');
        }

        await this.initialize();

        const blobName: string = this.getBlobName(activity);
        const data: string = JSON.stringify(activity);

        const metadata: Record<string, string> = {
            FromId: activity.from.id,
            RecipientId: activity.recipient.id,
        };

        if (activity.timestamp) {
            metadata.timestamp = activity.timestamp.toJSON();
        }

        const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
        const blobOptions = { blobHTTPHeaders: { blobContentType: 'application/json' }, metadata: metadata };
        await blockBlobClient.upload(data, data.length, blobOptions);
    }

    /**
     * Get activities for a conversation (Aka the transcript)
     *
     * @param channelId Channel Id.
     * @param conversationId Conversation Id.
     * @param continuationToken Continuation token to page through results.
     * @param startDate Earliest time to include.
     * @returns The PagedResult of activities.
     */
    async getTranscriptActivities(
        channelId: string,
        conversationId: string,
        continuationToken?: string,
        startDate?: Date
    ): Promise<PagedResult<Activity>> {
        if (!channelId) {
            throw new Error('Missing channelId');
        }

        if (!conversationId) {
            throw new Error('Missing conversationId');
        }

        if (!startDate) {
            startDate = new Date(0);
        }

        await this.initialize();

        const prefix: string = this.getDirName(channelId, conversationId) + '/';

        const listBlobResult = this.containerClient
            .listBlobsByHierarchy('/', {
                prefix: prefix,
            })
            .byPage({ continuationToken, maxPageSize: this.pageSize });

        let page = await listBlobResult.next();
        const result: Activity[] = [];
        let response: ContainerListBlobHierarchySegmentResponse | undefined;
        while (!page.done) {
            // Note: azure library does not properly type iterator result, hence the need to cast
            response = maybeCast<ContainerListBlobHierarchySegmentResponse>(page?.value ?? {});
            const blobItems = response?.segment?.blobItems ?? [];

            // Locate first index of results to slice from. If we have a start date, we want to return
            // activities after that start date. Otherwise we can simply return all activities in this page.
            const fromIdx =
                startDate != null
                    ? blobItems.findIndex(
                          (blobItem) => blobItem?.properties?.createdOn && blobItem?.properties?.createdOn >= startDate
                      )
                    : 0;

            if (fromIdx !== -1) {
                const activities = await pmap(
                    blobItems.slice(fromIdx),
                    async (blobItem) => {
                        const blobClient = this.containerClient.getBlobClient(blobItem.name);
                        const blob = await blobClient.download();

                        const { readableStreamBody: stream } = blob;
                        if (!stream) {
                            return null;
                        }

                        const contents = await getStream(stream);

                        const activity = JSON.parse(contents);
                        return { ...activity, timestamp: new Date(activity.timestamp) } as Activity;
                    },
                    { concurrency: this.concurrency }
                );

                activities.forEach((activity) => {
                    if (activity) result.push(activity);
                });
            }

            page = await listBlobResult.next();
        }

        return {
            continuationToken: response?.continuationToken ?? '',
            items: result.reduce<Activity[]>((acc, activity) => (activity ? acc.concat(activity) : acc), []),
        };
    }

    /**
     * List conversations in the channelId.
     *
     * @param channelId Channel Id.
     * @param continuationToken ContinuationToken token to page through results.
     * @returns A promise representation of [PagedResult<TranscriptInfo>](xref:botbuilder-core.PagedResult)
     */
    async listTranscripts(channelId: string, continuationToken?: string): Promise<PagedResult<TranscriptInfo>> {
        if (!channelId) {
            throw new Error('Missing channelId');
        }

        await this.initialize();

        // tslint:disable-next-line:prefer-template
        const prefix: string = this.getDirName(channelId) + '/';

        const iter = this.containerClient
            .listBlobsByHierarchy('/', {
                prefix: prefix,
            })
            .byPage({ continuationToken, maxPageSize: this.pageSize });

        let page = await iter.next();
        const result: any[] = [];
        let response: ContainerListBlobHierarchySegmentResponse | undefined;

        while (!page.done) {
            // Note: azure library does not properly type iterator result, hence the need to cast
            const response = maybeCast<ContainerListBlobHierarchySegmentResponse>(page?.value ?? {});
            const blobItems = response?.segment?.blobItems ?? [];

            const items = blobItems.map((blobItem) => {
                const [, id] = decodeURIComponent(blobItem.name).split('/');

                const created = blobItem.properties?.createdOn ? new Date(blobItem.properties?.createdOn) : new Date();

                return { channelId, created, id };
            });

            items.forEach((transcript) => {
                if (transcript) result.push(transcript);
            });

            page = await iter.next();
        }
        return {
            continuationToken: response?.continuationToken ?? '',
            items: result ?? [],
        };
    }

    /**
     * Delete a specific conversation and all of it's activities.
     *
     * @param channelId Channel Id where conversation took place.
     * @param conversationId Id of the conversation to delete.
     */
    async deleteTranscript(channelId: string, conversationId: string): Promise<void> {
        if (!channelId) {
            throw new Error('Missing channelId');
        }

        if (!conversationId) {
            throw new Error('Missing conversationId');
        }

        await this.initialize();

        // tslint:disable-next-line:prefer-template
        const prefix: string = this.getDirName(channelId, conversationId) + '/';

        const iter = this.containerClient.listBlobsByHierarchy('/', {
            prefix: prefix,
            includeMetadata: true,
        });

        const segment = iter.byPage({
            maxPageSize: this.pageSize,
        });

        let page = await segment.next();
        while (!page.done) {
            // Note: azure library does not properly type iterator result, hence the need to cast
            const response = maybeCast<ContainerListBlobHierarchySegmentResponse>(page?.value ?? {});
            const blobItems = response?.segment?.blobItems ?? [];

            await pmap(blobItems, (blobItem) => this.containerClient.deleteBlob(blobItem.name), {
                concurrency: this.concurrency,
            });

            page = await segment.next();
        }
    }

    /**
     * Check if a container name is valid.
     *
     * @param container String representing the container name to validate.
     * @returns A boolean value that indicates whether or not the name is valid.
     */
    private checkContainerName(container: string): boolean {
        return ContainerNameCheck.test(container);
    }

    /**
     * Get the blob name based on the [Activity](xref:botframework-schema.Activity).
     *
     * @param activity [Activity](xref:botframework-schema.Activity) to get the blob name from.
     * @returns The blob name.
     */
    private getBlobName(activity: Activity): string {
        const channelId: string = this.sanitizeKey(activity.channelId);
        const conversationId: string = this.sanitizeKey(activity.conversation.id);
        const timestamp: string = this.sanitizeKey(this.getTicks(activity.timestamp));
        const activityId: string = this.sanitizeKey(activity.id);

        return `${channelId}/${conversationId}/${timestamp}-${activityId}.json`;
    }

    /**
     * Get the directory name.
     *
     * @param channelId Channel Id.
     * @param conversationId Id of the conversation to get the directory name from.
     * @returns The sanitized directory name.
     */
    private getDirName(channelId: string, conversationId?: string): string {
        if (!conversationId) {
            return this.sanitizeKey(channelId);
        }

        return `${this.sanitizeKey(channelId)}/${this.sanitizeKey(conversationId)}`;
    }

    /**
     * Escape a given key to be compatible for use with BlobStorage.
     *
     * @param key Key to be sanitized(scaped).
     * @returns The sanitized key.
     */
    private sanitizeKey(key: string): string {
        return escape(key);
    }

    /**
     * @private
     */
    private getTicks(timestamp: Date): string {
        const epochTicks = 621355968000000000; // the number of .net ticks at the unix epoch
        const ticksPerMillisecond = 10000; // there are 10000 .net ticks per millisecond

        const ticks: number = epochTicks + timestamp.getTime() * ticksPerMillisecond;

        return ticks.toString(16);
    }
}
