/**
 * @module botbuilder-azure
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TranscriptStore, Activity, PagedResult, Transcript } from 'botbuilder';
import { BlobStorageSettings } from "./blobStorage";
/**
 * Stores transcripts in an Azure Blob container.
 *
 * @remarks
 * Each activity is stored as JSON blob with a structure of
 * `container/{channelId]/{conversationId}/{Timestamp.ticks}-{activity.id}.json`.
 */
export declare class AzureBlobTranscriptStore implements TranscriptStore {
    private settings;
    private client;
    private pageSize;
    /**
     * Creates a new AzureBlobTranscriptStore instance.
     * @param settings Settings required for configuring an instance of BlobStorage
     */
    constructor(settings: BlobStorageSettings);
    /**
     * Log an activity to the transcript.
     * @param activity Activity being logged.
     */
    logActivity(activity: Activity): void | Promise<void>;
    /**
     * Get activities for a conversation (Aka the transcript)
     * @param channelId Channel Id.
     * @param conversationId Conversation Id.
     * @param continuationToken Continuatuation token to page through results.
     * @param startDate Earliest time to include.
     */
    getTranscriptActivities(channelId: string, conversationId: string, continuationToken?: string, startDate?: Date): Promise<PagedResult<Activity>>;
    private blobToActivity(blob);
    private getActivityBlobs(blobs, container, prefix, continuationToken, startDate, token);
    /**
     * List conversations in the channelId.
     * @param channelId Channel Id.
     * @param continuationToken Continuatuation token to page through results.
     */
    listTranscripts(channelId: string, continuationToken?: string): Promise<PagedResult<Transcript>>;
    private getTranscriptsFolders(transcripts, container, prefix, continuationToken, channelId, token);
    /**
     * Delete a specific conversation and all of it's activities.
     * @param channelId Channel Id where conversation took place.
     * @param conversationId Id of the conversation to delete.
     */
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
