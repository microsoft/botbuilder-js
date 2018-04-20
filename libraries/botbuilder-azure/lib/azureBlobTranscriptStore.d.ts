/**
 * @module botbuilder-azure
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TranscriptStore, Activity, PagedResult, Transcript } from 'botbuilder';
import { BlobStorageSettings } from "./blobStorage";
export declare class AzureBlobTranscriptStore implements TranscriptStore {
    private settings;
    private client;
    private pageSize;
    constructor(settings: BlobStorageSettings);
    logActivity(activity: Activity): void | Promise<void>;
    getTranscriptActivities(channelId: string, conversationId: string, continuationToken?: string, startDate?: Date): Promise<PagedResult<Activity>>;
    private blobToActivity(blob);
    private getActivityBlobs(blobs, container, prefix, continuationToken, startDate, token);
    listTranscripts(channelId: string, continuationToken?: string): Promise<PagedResult<Transcript>>;
    private getTranscriptsFolders(transcripts, container, prefix, continuationToken, channelId, token);
    deleteTranscript(channelId: string, conversationId: string): Promise<void>;
    private getConversationsBlobs(blobs, container, prefix, token);
    private checkContainerName(container);
    private getBlobName(activity);
    private getDirName(channelId, conversationId?);
    private sanitizeKey(key);
    private getTicks(timestamp);
    private ensureContainerExists();
    private createBlobService(storageAccountOrConnectionString, storageAccessKey, host);
    private denodeify<T>(thisArg, fn);
}
