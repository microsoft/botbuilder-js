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
 * Internal dictionary with the containers where entities will be stored.
 */
let checkedCollections = {};
class AzureBlobTranscriptStore {
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
    logActivity(activity) {
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
            let writeBlob = this.client.createBlockBlobFromTextAsync(container.name, blobName, JSON.stringify(activity), null);
            return Promise.all([writeProperties, writeMetadata, writeBlob]).then(() => { });
        });
    }
    getTranscriptActivities(channelId, conversationId, continuationToken, startDate) {
        if (!channelId) {
            throw new Error("Missing channelId");
        }
        if (!conversationId) {
            throw new Error("Missing conversationId");
        }
        let prefix = this.getDirName(channelId, conversationId);
        let token = {};
        return this.ensureContainerExists().then((container) => {
            return this.getActivityBlobs([], container.name, prefix, continuationToken, startDate, token).then((blobs) => {
                return Promise.all(blobs.map((blob) => {
                    return this.client.getBlobToTextAsync(container.name, blob.name).then((content) => {
                        return JSON.parse(content);
                    });
                })).then((activities) => {
                    let pagedResult = new botbuilder_1.PagedResult();
                    pagedResult.items = activities;
                    if (pagedResult.items.length == this.pageSize) {
                        pagedResult.continuationToken = blobs.slice(-1).pop().name;
                    }
                    return pagedResult;
                });
            });
        });
    }
    getActivityBlobs(blobs, container, prefix, continuationToken, startDate, token) {
        return new Promise((resolve, reject) => {
            this.client.listBlobsSegmentedWithPrefixAsync(container, prefix, token).then((result) => {
                result.entries.some((blob) => {
                    let timestamp = Number.parseInt(blob.metadata["Timestamp"], 10);
                    if (timestamp >= startDate.getTime()) {
                        if (continuationToken !== null) {
                            if (blob.name === continuationToken) {
                                continuationToken = null;
                            }
                        }
                        else {
                            blobs.push(blob);
                            return (blobs.length === this.pageSize);
                        }
                    }
                    return false;
                });
                if (result.continuationToken !== null && blobs.length < this.pageSize) {
                    resolve(this.getActivityBlobs(blobs, container, prefix, continuationToken, startDate, result.continuationToken));
                }
                resolve(blobs);
            });
        });
    }
    listTranscripts(channelId, continuationToken) {
        if (!channelId) {
            throw new Error("Missing channelId");
        }
        let prefix = this.getDirName(channelId);
        let token = {};
        return this.ensureContainerExists().then((container) => {
            return this.getTranscriptsFolders([], container.name, prefix, continuationToken, channelId, token).then((transcripts) => {
                let pagedResult = new botbuilder_1.PagedResult();
                pagedResult.items = transcripts;
                if (pagedResult.items.length == this.pageSize) {
                    pagedResult.continuationToken = transcripts.slice(-1).pop().id;
                }
                return pagedResult;
            });
        });
    }
    getTranscriptsFolders(transcripts, container, prefix, continuationToken, channelId, token) {
        return new Promise((resolve, reject) => {
            this.client.listBlobDirectoriesSegmentedWithPrefixAsync(container, prefix, token).then((result) => {
                console.log(result);
                result.entries.some((blob) => {
                    let conversation = new botbuilder_1.Transcript();
                    conversation.id = blob.name.split('/').slice(-1).pop();
                    conversation.channelId = channelId;
                    if (continuationToken !== null) {
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
                if (result.continuationToken !== null && transcripts.length < this.pageSize) {
                    resolve(this.getTranscriptsFolders(transcripts, container, prefix, continuationToken, channelId, result.continuationToken));
                }
                resolve(transcripts);
            });
        });
    }
    deleteTranscript(channelId, conversationId) {
        if (!channelId) {
            throw new Error("Missing channelId");
        }
        if (!conversationId) {
            throw new Error("Missing conversationId");
        }
        let prefix = this.getDirName(channelId, conversationId);
        let token = {};
        return this.ensureContainerExists().then((container) => {
            return this.getConversationsBlobs([], container.name, prefix, token).then((blobs) => {
                return Promise.all(blobs.map((blob) => {
                    return this.client.deleteBlobIfExistsAsync(container.name, blob.name);
                })).then(() => { });
            });
        });
    }
    getConversationsBlobs(blobs, container, prefix, token) {
        return new Promise((resolve, reject) => {
            this.client.listBlobsSegmentedWithPrefixAsync(container, prefix, token).then((result) => {
                if (result.continuationToken !== null) {
                    resolve(this.getConversationsBlobs(blobs.concat(result.entries), container, prefix, result.continuationToken));
                }
                resolve(blobs.concat(result.entries));
            });
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