/**
 * @module botbuilder-azure
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TranscriptStore, Activity, PagedResult, Transcript } from 'botbuilder';
import { BlobStorageSettings } from "./blobStorage";
import * as azure from 'azure-storage';
import { escape } from 'querystring';

const ContainerNameCheck = new RegExp('^[a-z0-9](?!.*--)[a-z0-9-]{1,61}[a-z0-9]$');

/**
 * Internal dictionary with the containers where entities will be stored.
 */
let checkedCollections: { [key: string]: Promise<azure.BlobService.ContainerResult>; } = {};

export class AzureBlobTranscriptStore implements TranscriptStore {
    private settings: BlobStorageSettings
    private client: BlobServiceAsync
    private pageSize = 20;

    public constructor(settings: BlobStorageSettings) {
        if (!settings) {
            throw new Error('The settings parameter is required.');
        }

        if (!settings.containerName) {
            throw new Error('The containerName is required.');
        }

        if (!this.checkContainerName(settings.containerName)) {
            throw new Error('Invalid container name.');
        }

        this.settings = Object.assign({}, settings)
        this.client = this.createBlobService(this.settings.storageAccountOrConnectionString, this.settings.storageAccessKey, this.settings.host);
    }

    logActivity(activity: Activity): void | Promise<void> {
        if (!activity) {
            throw new Error('Missing activity.');
        }

        let blobName = this.getBlobName(activity);
        return this.ensureContainerExists().then((container) => {
            let writeProperties = this.client.setBlobPropertiesAsync(container.name, blobName, {
                contentType: 'application/json'
            });
            let writeMetadata = this.client.setBlobMetadataAsync(container.name, blobName, {
                'FromId': activity.from.id,
                'RecipientId': activity.recipient.id,
                'Timestamp': activity.timestamp.getTime().toString()
            });
            let writeBlob = this.client.createBlockBlobFromTextAsync(container.name, blobName,
                JSON.stringify(activity), null);
            return Promise.all([ writeProperties, writeMetadata, writeBlob ]).then(() => {});
        });

    }

    getTranscriptActivities(channelId: string, conversationId: string, continuationToken?: string, startDate?: Date): Promise<PagedResult<Activity>> {
        if (!channelId) {
            throw new Error("Missing channelId");
        }

        if (!conversationId) {
            throw new Error("Missing conversationId");
        }

        let prefix = this.getDirName(channelId, conversationId);
        let token = {} as azure.common.ContinuationToken;

        return this.ensureContainerExists().then((container) => {
            return this.getActivityBlobs([], container.name, prefix, continuationToken, startDate, token).then((blobs) => {
                return Promise.all(blobs.map((blob) => {
                    return this.client.getBlobToTextAsync(container.name, blob.name).then((content) => {
                        return JSON.parse(content as any) as Activity;
                    });
                })).then((activities) => {
                    let pagedResult = new PagedResult<Activity>();
                    pagedResult.items = activities;
                    if (pagedResult.items.length == this.pageSize) {
                        pagedResult.continuationToken = blobs.slice(-1).pop().name;
                    }
                    return pagedResult;
                })
            });
        });
    }

    private getActivityBlobs(blobs: azure.BlobService.BlobResult[], container: string, prefix: string, continuationToken: string, startDate: Date, token: azure.common.ContinuationToken): Promise<azure.BlobService.BlobResult[]> {
        return new Promise((resolve, reject) => {
            this.client.listBlobsSegmentedWithPrefixAsync(container, prefix, token).then((result) => {
                result.entries.some((blob) => {
                    let timestamp = Number.parseInt(blob.metadata["Timestamp"], 10);
                    if (timestamp >= startDate.getTime()) {
                        if (continuationToken !== null) {
                            if (blob.name === continuationToken) {
                                continuationToken = null;
                            }
                        } else {
                            blobs.push(blob);
                            return (blobs.length === this.pageSize);
                        }
                    }
                    return false
                });
                if (result.continuationToken !== null && blobs.length < this.pageSize) {
                    resolve(this.getActivityBlobs(blobs, container, prefix, continuationToken, startDate, result.continuationToken))
                }
                resolve(blobs);
            });
        });
    }

    listTranscripts(channelId: string, continuationToken?: string): Promise<PagedResult<Transcript>> {
        if (!channelId) {
            throw new Error("Missing channelId");
        }

        let prefix = this.getDirName(channelId);
        let token = {} as azure.common.ContinuationToken;

        return this.ensureContainerExists().then((container) => {
            return this.getTranscriptsFolders([], container.name, prefix, continuationToken, channelId, token).then((transcripts) => {
                let pagedResult = new PagedResult<Transcript>();
                pagedResult.items = transcripts;
                if (pagedResult.items.length == this.pageSize) {
                    pagedResult.continuationToken = transcripts.slice(-1).pop().id;
                }
                return pagedResult;
            });
        });
    }

    private getTranscriptsFolders(transcripts: Transcript[], container: string, prefix: string, continuationToken: string, channelId: string, token: azure.common.ContinuationToken): Promise<Transcript[]> {
        return new Promise((resolve, reject) => {
            this.client.listBlobDirectoriesSegmentedWithPrefixAsync(container, prefix, token).then((result) => {
                console.log(result);
                result.entries.some((blob) => {
                    let conversation = new Transcript();
                    conversation.id = blob.name.split('/').slice(-1).pop();
                    conversation.channelId = channelId;
                    if (continuationToken !== null) {
                        if (conversation.id === continuationToken) {
                            continuationToken = null;
                        }
                    } else {
                        transcripts.push(conversation);
                        return (transcripts.length === this.pageSize);
                    }
                    return false
                });
                if (result.continuationToken !== null && transcripts.length < this.pageSize) {
                    resolve(this.getTranscriptsFolders(transcripts, container, prefix, continuationToken, channelId, result.continuationToken))
                }
                resolve(transcripts);
            });
        });
    }

    deleteTranscript(channelId: string, conversationId: string): Promise<void> {
        if (!channelId) {
            throw new Error("Missing channelId");
        }

        if (!conversationId) {
            throw new Error("Missing conversationId");
        }

        let prefix = this.getDirName(channelId, conversationId);
        let token = {} as azure.common.ContinuationToken;
        
        return this.ensureContainerExists().then((container) => {
            return this.getConversationsBlobs([], container.name, prefix, token).then((blobs) => {
                return Promise.all(blobs.map((blob) => {
                    return this.client.deleteBlobIfExistsAsync(container.name, blob.name);
                })).then(() => {});
            });
        });
    }

    private getConversationsBlobs(blobs: azure.BlobService.BlobResult[], container: string, prefix: string, token: azure.common.ContinuationToken): Promise<azure.BlobService.BlobResult[]> {
        return new Promise((resolve, reject) => {
            this.client.listBlobsSegmentedWithPrefixAsync(container, prefix, token).then((result) => {
                if (result.continuationToken !== null) {
                    resolve(this.getConversationsBlobs(blobs.concat(result.entries), container, prefix, result.continuationToken))
                }
                resolve(blobs.concat(result.entries));
            });
        });
    }

    private checkContainerName(container: string): boolean {
        return ContainerNameCheck.test(container);
    }

    private getBlobName(activity: Activity): string {
        let channelId = this.sanitizeKey(activity.channelId);
        let conversationId = this.sanitizeKey(activity.conversation.id);
        let timestamp = this.sanitizeKey(this.getTicks(activity.timestamp));
        let activityId = this.sanitizeKey(activity.id);
        return `${channelId}/${conversationId}/${timestamp}-${activityId}.json`;
    }

    private getDirName(channelId: string, conversationId?: string): string {
        if (!conversationId) {
            return this.sanitizeKey(channelId);
        }
        return `${this.sanitizeKey(channelId)}/${this.sanitizeKey(conversationId)}`;
    }

    private sanitizeKey(key: string): string {
        return escape(key);
    }

    private getTicks(timestamp: Date): string {
        var epochTicks = 621355968000000000; // the number of .net ticks at the unix epoch
        var ticksPerMillisecond = 10000; // there are 10000 .net ticks per millisecond

        let ticks = epochTicks + (timestamp.getTime() * ticksPerMillisecond);
        return ticks.toString(16);
    }

    private ensureContainerExists(): Promise<azure.BlobService.ContainerResult> {
        let key = this.settings.containerName;
        if (!checkedCollections[key]) {
            checkedCollections[key] = this.client.createContainerIfNotExistsAsync(key);
        }
        return checkedCollections[key];
    }

    private createBlobService(storageAccountOrConnectionString: string, storageAccessKey: string, host: any): BlobServiceAsync {
        if (!storageAccountOrConnectionString) {
            throw new Error('The storageAccountOrConnectionString parameter is required.');
        }

        const blobService = azure.createBlobService(storageAccountOrConnectionString, storageAccessKey, host).withFilter(new azure.LinearRetryPolicyFilter(5, 500));
        
        // create BlobServiceAsync by using denodeify to create promise wrappers around cb functions
        return Object.assign(blobService as any, {
            createContainerIfNotExistsAsync: this.denodeify(blobService, blobService.createContainerIfNotExists),
            deleteContainerIfExistsAsync: this.denodeify(blobService, blobService.deleteContainerIfExists),

            createBlockBlobFromTextAsync: this.denodeify(blobService, blobService.createBlockBlobFromText),
            getBlobMetadataAsync: this.denodeify(blobService, blobService.getBlobMetadata),
            setBlobMetadataAsync: this.denodeify(blobService, blobService.setBlobMetadata),
            getBlobPropertiesAsync: this.denodeify(blobService, blobService.getBlobProperties),
            setBlobPropertiesAsync: this.denodeify(blobService, blobService.setBlobProperties),
            getBlobToTextAsync: this.denodeify(blobService, blobService.getBlobToText),
            deleteBlobIfExistsAsync: this.denodeify(blobService, blobService.deleteBlobIfExists),
            listBlobsSegmentedWithPrefixAsync: this.denodeify(blobService, blobService.listBlobsSegmentedWithPrefix),
            listBlobDirectoriesSegmentedWithPrefixAsync: this.denodeify(blobService, blobService['listBlobDirectoriesSegmentedWithPrefix'])
        });
    }

    // turn a cb based azure method into a Promisified one
    private denodeify<T>(thisArg: any, fn: Function): (...args: any[]) => Promise<T> {
        return (...args: any[]) => {
            return new Promise<T>((resolve, reject) => {
                args.push((error: Error, result: any) => (error) ? reject(error) : resolve(result));
                fn.apply(thisArg, args);
            });
        };
    }
}

// Promise based methods created using denodeify function
interface BlobServiceAsync extends azure.BlobService {
    createContainerIfNotExistsAsync(container: string): Promise<azure.BlobService.ContainerResult>;
    deleteContainerIfExistsAsync(container: string): Promise<boolean>;

    createBlockBlobFromTextAsync(container: string, blob: string, text: string | Buffer, options: azure.BlobService.CreateBlobRequestOptions): Promise<azure.BlobService.BlobResult>;
    getBlobMetadataAsync(container: string, blob: string): Promise<azure.BlobService.BlobResult>;
    setBlobMetadataAsync(container: string, blob: string, metadata: { [index: string] : string }): Promise<azure.BlobService.BlobResult>;
    getBlobPropertiesAsync(container: string, blob: string): Promise<azure.BlobService.BlobResult>;
    setBlobPropertiesAsync(container: string, blob: string, propertiesAndOptions: azure.BlobService.SetBlobPropertiesRequestOptions): Promise<azure.BlobService.BlobResult>;
    getBlobToTextAsync(container: string, blob: string): Promise<azure.BlobService.BlobToText>;
    deleteBlobIfExistsAsync(container: string, blob: string): Promise<boolean>;
    listBlobsSegmentedWithPrefixAsync(container: string, prefix: string, currentToken: azure.common.ContinuationToken): Promise<azure.BlobService.ListBlobsResult>;
    listBlobDirectoriesSegmentedWithPrefixAsync(container: string, prefix: string, currentToken: azure.common.ContinuationToken): Promise<azure.BlobService.ListBlobsResult>;
}