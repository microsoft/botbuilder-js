"use strict";
/**
 * @module botbuilder-azure
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
const azure = require("azure-storage");
const querystring_1 = require("querystring");
const ContainerNameCheck = new RegExp('^[a-z0-9](?!.*--)[a-z0-9-]{1,61}[a-z0-9]$');
/**
 * @private
 * Internal dictionary with the containers where entities will be stored.
 */
const checkedCollections = {};
/**
 * Stores transcripts in an Azure Blob container.
 *
 * @remarks
 * Each activity is stored as JSON blob with a structure of
 * `container/{channelId]/{conversationId}/{Timestamp.ticks}-{activity.id}.json`.
 */
class AzureBlobTranscriptStore {
    /**
     * Creates a new AzureBlobTranscriptStore instance.
     * @param settings Settings required for configuring an instance of BlobStorage
     */
    constructor(settings) {
        this.pageSize = 20;
        if (!settings) {
            throw new Error('The settings parameter is required.');
        }
        if (!settings.containerName) {
            throw new Error('The containerName is required.');
        }
        if (!this.checkContainerName(settings.containerName)) {
            throw new Error('Invalid container name.');
        }
        this.settings = Object.assign({}, settings);
        this.client = this.createBlobService(this.settings.storageAccountOrConnectionString, this.settings.storageAccessKey, this.settings.host);
    }
    /**
     * Log an activity to the transcript.
     * @param activity Activity being logged.
     */
    logActivity(activity) {
        if (!activity) {
            throw new Error('Missing activity.');
        }
        let blobName = this.getBlobName(activity);
        let data = JSON.stringify(activity);
        return this.ensureContainerExists().then((container) => {
            let writeProperties = () => this.client.setBlobPropertiesAsync(container.name, blobName, {
                contentType: 'application/json'
            });
            let writeMetadata = () => this.client.setBlobMetadataAsync(container.name, blobName, {
                'fromid': activity.from.id,
                'recipientid': activity.recipient.id,
                'timestamp': activity.timestamp.getTime().toString()
            });
            let writeData = () => this.client.createBlockBlobFromTextAsync(container.name, blobName, data, null);
            return writeData().then(writeProperties).then(writeMetadata).then(() => { });
        });
    }
    /**
     * Get activities for a conversation (Aka the transcript)
     * @param channelId Channel Id.
     * @param conversationId Conversation Id.
     * @param continuationToken Continuatuation token to page through results.
     * @param startDate Earliest time to include.
     */
    getTranscriptActivities(channelId, conversationId, continuationToken, startDate) {
        if (!channelId) {
            throw new Error("Missing channelId");
        }
        if (!conversationId) {
            throw new Error("Missing conversationId");
        }
        if (!startDate) {
            startDate = new Date(0);
        }
        let prefix = this.getDirName(channelId, conversationId) + '/';
        let token = null;
        return this.ensureContainerExists()
            .then(container => this.getActivityBlobs([], container.name, prefix, continuationToken, startDate, token))
            .then((blobs) => {
            return Promise.all(blobs.map(blob => this.blobToActivity(blob)))
                .then((activities) => {
                let pagedResult = new botbuilder_1.PagedResult();
                pagedResult.items = activities;
                if (pagedResult.items.length == this.pageSize) {
                    pagedResult.continuationToken = blobs.slice(-1).pop().name;
                }
                return pagedResult;
            });
        });
    }
    blobToActivity(blob) {
        return this.client.getBlobToTextAsync(blob.container, blob.name)
            .then((content) => {
            let activity = JSON.parse(content);
            activity.timestamp = new Date(activity.timestamp);
            return activity;
        });
    }
    getActivityBlobs(blobs, container, prefix, continuationToken, startDate, token) {
        return new Promise((resolve, reject) => {
            this.client.listBlobsSegmentedWithPrefixAsync(container, prefix, token, { include: 'metadata' })
                .then((result) => {
                result.entries.some((blob) => {
                    let timestamp = Number.parseInt(blob.metadata['timestamp'], 10);
                    if (timestamp >= startDate.getTime()) {
                        if (continuationToken) {
                            if (blob.name === continuationToken) {
                                continuationToken = null;
                            }
                        }
                        else {
                            blob.container = container;
                            blobs.push(blob);
                            return (blobs.length === this.pageSize);
                        }
                    }
                    return false;
                });
                if (result.continuationToken && blobs.length < this.pageSize) {
                    resolve(this.getActivityBlobs(blobs, container, prefix, continuationToken, startDate, result.continuationToken));
                }
                resolve(blobs);
            })
                .catch(error => reject(error));
        });
    }
    /**
     * List conversations in the channelId.
     * @param channelId Channel Id.
     * @param continuationToken Continuatuation token to page through results.
     */
    listTranscripts(channelId, continuationToken) {
        if (!channelId) {
            throw new Error("Missing channelId");
        }
        let prefix = this.getDirName(channelId) + '/';
        let token = null;
        return this.ensureContainerExists()
            .then(container => this.getTranscriptsFolders([], container.name, prefix, continuationToken, channelId, token))
            .then(transcripts => {
            let pagedResult = new botbuilder_1.PagedResult();
            pagedResult.items = transcripts;
            if (pagedResult.items.length == this.pageSize) {
                pagedResult.continuationToken = transcripts.slice(-1).pop().id;
            }
            return pagedResult;
        });
    }
    getTranscriptsFolders(transcripts, container, prefix, continuationToken, channelId, token) {
        return new Promise((resolve, reject) => {
            this.client.listBlobDirectoriesSegmentedWithPrefixAsync(container, prefix, token).then((result) => {
                result.entries.some((blob) => {
                    let conversation = new botbuilder_1.Transcript();
                    conversation.id = blob.name.split('/').filter(part => part).slice(-1).pop();
                    conversation.channelId = channelId;
                    if (continuationToken) {
                        if (conversation.id === continuationToken) {
                            continuationToken = null;
                        }
                    }
                    else {
                        transcripts.push(conversation);
                        return (transcripts.length === this.pageSize);
                    }
                    return false;
                });
                if (result.continuationToken && transcripts.length < this.pageSize) {
                    resolve(this.getTranscriptsFolders(transcripts, container, prefix, continuationToken, channelId, result.continuationToken));
                }
                resolve(transcripts);
            })
                .catch(error => reject(error));
        });
    }
    /**
     * Delete a specific conversation and all of it's activities.
     * @param channelId Channel Id where conversation took place.
     * @param conversationId Id of the conversation to delete.
     */
    deleteTranscript(channelId, conversationId) {
        if (!channelId) {
            throw new Error("Missing channelId");
        }
        if (!conversationId) {
            throw new Error("Missing conversationId");
        }
        let prefix = this.getDirName(channelId, conversationId) + '/';
        let token = null;
        return this.ensureContainerExists()
            .then(container => this.getConversationsBlobs([], container.name, prefix, token))
            .then(blobs => Promise.all(blobs.map(blob => this.client.deleteBlobIfExistsAsync(blob.container, blob.name))))
            .then(results => { });
    }
    getConversationsBlobs(blobs, container, prefix, token) {
        return new Promise((resolve, reject) => {
            this.client.listBlobsSegmentedWithPrefixAsync(container, prefix, token, null)
                .then((result) => {
                blobs = blobs.concat(result.entries.map(blob => {
                    blob.container = container;
                    return blob;
                }));
                if (result.continuationToken) {
                    resolve(this.getConversationsBlobs(blobs, container, prefix, result.continuationToken));
                }
                resolve(blobs);
            })
                .catch(error => reject(error));
        });
    }
    checkContainerName(container) {
        return ContainerNameCheck.test(container);
    }
    getBlobName(activity) {
        let channelId = this.sanitizeKey(activity.channelId);
        let conversationId = this.sanitizeKey(activity.conversation.id);
        let timestamp = this.sanitizeKey(this.getTicks(activity.timestamp));
        let activityId = this.sanitizeKey(activity.id);
        return `${channelId}/${conversationId}/${timestamp}-${activityId}.json`;
    }
    getDirName(channelId, conversationId) {
        if (!conversationId) {
            return this.sanitizeKey(channelId);
        }
        return `${this.sanitizeKey(channelId)}/${this.sanitizeKey(conversationId)}`;
    }
    sanitizeKey(key) {
        return querystring_1.escape(key);
    }
    getTicks(timestamp) {
        var epochTicks = 621355968000000000; // the number of .net ticks at the unix epoch
        var ticksPerMillisecond = 10000; // there are 10000 .net ticks per millisecond
        let ticks = epochTicks + (timestamp.getTime() * ticksPerMillisecond);
        return ticks.toString(16);
    }
    ensureContainerExists() {
        let key = this.settings.containerName;
        if (!checkedCollections[key]) {
            checkedCollections[key] = this.client.createContainerIfNotExistsAsync(key);
        }
        return checkedCollections[key];
    }
    createBlobService(storageAccountOrConnectionString, storageAccessKey, host) {
        if (!storageAccountOrConnectionString) {
            throw new Error('The storageAccountOrConnectionString parameter is required.');
        }
        const blobService = azure.createBlobService(storageAccountOrConnectionString, storageAccessKey, host).withFilter(new azure.LinearRetryPolicyFilter(5, 500));
        // create BlobServiceAsync by using denodeify to create promise wrappers around cb functions
        return Object.assign(blobService, {
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
    denodeify(thisArg, fn) {
        return (...args) => {
            return new Promise((resolve, reject) => {
                args.push((error, result) => (error) ? reject(error) : resolve(result));
                fn.apply(thisArg, args);
            });
        };
    }
}
exports.AzureBlobTranscriptStore = AzureBlobTranscriptStore;
//# sourceMappingURL=azureBlobTranscriptStore.js.map