"use strict";
/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("async-file");
const filenamify = require("filenamify");
const transcriptLogger_1 = require("./transcriptLogger");
/**
 * The file transcript store stores transcripts in file system with each activity as a file.
 */
class FileTranscriptStore {
    /**
     * Creates an instance of FileTranscriptStore
     * @param folder Root folder where transcript will be stored.
     */
    constructor(folder) {
        if (!folder) {
            throw new Error('Missing folder.');
        }
        this.rootFolder = folder;
    }
    /**
     * Log an activity to the transcript.
     * @param activity Activity being logged.
     */
    logActivity(activity) {
        if (!activity) {
            throw new Error("activity cannot be null for logActivity()");
        }
        let conversationFolder = this.getTranscriptFolder(activity.channelId, activity.conversation.id);
        let activityFileName = this.getActivityFilename(activity);
        return this.saveActivity(activity, conversationFolder, activityFileName);
    }
    /**
     * Get activities for a conversation (Aka the transcript)
     * @param channelId Channel Id.
     * @param conversationId Conversation Id.
     * @param continuationToken Continuatuation token to page through results.
     * @param startDate Earliest time to include.
     */
    getTranscriptActivities(channelId, conversationId, continuationToken, startDate) {
        if (!channelId)
            throw new Error('Missing channelId');
        if (!conversationId)
            throw new Error('Missing conversationId');
        let pagedResult = new transcriptLogger_1.PagedResult();
        let transcriptFolder = this.getTranscriptFolder(channelId, conversationId);
        return fs.exists(transcriptFolder).then(exists => {
            if (!exists)
                return pagedResult;
            return fs.readdir(transcriptFolder)
                .then(files => files
                .filter(f => f.endsWith('.json')) // .json only
                .sort() // sorted
                .filter(dateFilter(startDate))) // >= startDate
                .then(files => {
                // get proper page
                if (continuationToken) {
                    return files
                        .filter(withContinuationToken(continuationToken))
                        .slice(1, FileTranscriptStore.PageSize + 1);
                }
                else {
                    return files.slice(0, FileTranscriptStore.PageSize);
                }
            })
                .then(files => files.map(activityFilename => fs.readFile(path.join(transcriptFolder, activityFilename), 'utf8')))
                .then(reads => Promise.all(reads))
                .then(jsons => {
                let items = jsons.map(json => JSON.parse(json));
                pagedResult.items = items;
                if (pagedResult.items.length === FileTranscriptStore.PageSize) {
                    pagedResult.continuationToken = pagedResult.items[pagedResult.items.length - 1].id;
                }
                return pagedResult;
            });
        });
    }
    /**
     * List conversations in the channelId.
     * @param channelId Channel Id.
     * @param continuationToken Continuatuation token to page through results.
     */
    listTranscripts(channelId, continuationToken) {
        if (!channelId)
            throw new Error('Missing channelId');
        let pagedResult = new transcriptLogger_1.PagedResult();
        let channelFolder = this.getChannelFolder(channelId);
        return fs.exists(channelFolder).then(exists => {
            if (!exists)
                return pagedResult;
            return fs.readdir(channelFolder)
                .then(dirs => {
                let items = [];
                if (continuationToken) {
                    items = dirs
                        .filter(skipWhileExpression(di => di != continuationToken))
                        .slice(1, FileTranscriptStore.PageSize + 1);
                }
                else {
                    items = dirs.slice(0, FileTranscriptStore.PageSize);
                }
                pagedResult.items = items.map(i => ({
                    channelId: channelId,
                    id: i,
                    created: null
                }));
                if (pagedResult.items.length === FileTranscriptStore.PageSize) {
                    pagedResult.continuationToken = pagedResult.items[pagedResult.items.length - 1].id;
                }
                return pagedResult;
            });
        });
    }
    /**
     * Delete a specific conversation and all of it's activities.
     * @param channelId Channel Id where conversation took place.
     * @param conversationId Id of the conversation to delete.
     */
    deleteTranscript(channelId, conversationId) {
        if (!channelId)
            throw new Error('Missing channelId');
        if (!conversationId)
            throw new Error('Missing conversationId');
        let transcriptFolder = this.getTranscriptFolder(channelId, conversationId);
        return fs.exists(transcriptFolder).then(exists => {
            return exists ? fs.rmdir(transcriptFolder) : Promise.resolve();
        });
    }
    saveActivity(activity, transcriptPath, activityFilename) {
        let json = JSON.stringify(activity, null, '\t');
        return this.ensureFolder(transcriptPath).then(() => {
            return fs.writeFile(path.join(transcriptPath, activityFilename), json, 'utf8');
        });
    }
    ensureFolder(path) {
        return fs.exists(path).then(exists => {
            if (!exists)
                return fs.mkdirp(path);
        });
    }
    getActivityFilename(activity) {
        return `${activity.timestamp.getTime()}-${this.sanitizeKey(activity.id)}.json`;
    }
    getChannelFolder(channelId) {
        return path.join(this.rootFolder, this.sanitizeKey(channelId));
    }
    getTranscriptFolder(channelId, conversationId) {
        return path.join(this.rootFolder, this.sanitizeKey(channelId), this.sanitizeKey(conversationId));
    }
    sanitizeKey(key) {
        return filenamify(key);
    }
}
FileTranscriptStore.PageSize = 20;
exports.FileTranscriptStore = FileTranscriptStore;
const dateFilter = (date) => {
    if (!date)
        return () => true;
    let ticks = date.getTime();
    return (filename) => {
        let activityTicks = parseInt(filename.split('-')[0], 10);
        return activityTicks >= ticks;
    };
};
const withContinuationToken = (continuationToken) => {
    if (!continuationToken)
        return () => true;
    return skipWhileExpression(fileName => {
        var id = fileName.split('-')[1].split('.json')[0];
        return id !== continuationToken;
    });
};
const skipWhileExpression = (expression) => {
    let skipping = true;
    return (item) => {
        if (!skipping)
            return true;
        if (!expression(item)) {
            skipping = false;
        }
        return false;
    };
};
//# sourceMappingURL=fileTranscriptStore.js.map