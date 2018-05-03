/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as path from 'path';
import * as fs from 'async-file';
import * as file from 'fs';
import * as filenamify from 'filenamify';
import * as rimraf from 'rimraf';
import { TranscriptStore, PagedResult, Transcript } from "./transcriptLogger";
import { Activity } from "botbuilder-core";

/**
 * The file transcript store stores transcripts in file system with each activity as a file.
 */
export class FileTranscriptStore implements TranscriptStore {

    private static readonly PageSize: number = 20;

    private rootFolder: string;

    /**
     * Creates an instance of FileTranscriptStore
     * @param folder Root folder where transcript will be stored.
     */
    constructor(folder: string) {
        if (!folder) {
            throw new Error('Missing folder.');
        }

        this.rootFolder = folder;
    }

    /**
     * Log an activity to the transcript.
     * @param activity Activity being logged.
     */
    logActivity(activity: Activity): void | Promise<void> {
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
    getTranscriptActivities(channelId: string, conversationId: string, continuationToken?: string, startDate?: Date): Promise<PagedResult<Activity>> {
        if (!channelId)
            throw new Error('Missing channelId');

        if (!conversationId)
            throw new Error('Missing conversationId');

        let pagedResult = new PagedResult<Activity>();
        let transcriptFolder = this.getTranscriptFolder(channelId, conversationId);
        return fs.exists(transcriptFolder).then(exists => {
            if (!exists) return pagedResult;

            return fs.readdir(transcriptFolder)
                .then(files => files
                    .filter(f => f.endsWith('.json'))               // .json only
                    .sort()                                         // sorted
                    .filter(withDateFilter(startDate)))             // >= startDate
                .then(files => {
                    // get proper page
                    if (continuationToken) {
                        return files
                            .filter(withContinuationToken(continuationToken))
                            .slice(1, FileTranscriptStore.PageSize + 1);
                    } else {
                        return files.slice(0, FileTranscriptStore.PageSize);
                    }
                })
                .then(files => files.map(activityFilename =>
                    fs.readFile(path.join(transcriptFolder, activityFilename), 'utf8')))
                .then(reads => Promise.all(reads))
                .then(jsons => {
                    let items = jsons.map(parseActivity);
                    pagedResult.items = items;
                    if (pagedResult.items.length === FileTranscriptStore.PageSize) {
                        pagedResult.continuationToken = pagedResult.items[pagedResult.items.length - 1].id;
                    }

                    return pagedResult;
                })
        })
    }

    /**
     * List conversations in the channelId.
     * @param channelId Channel Id.
     * @param continuationToken Continuatuation token to page through results.
     */
    listTranscripts(channelId: string, continuationToken?: string): Promise<PagedResult<Transcript>> {
        if (!channelId)
            throw new Error('Missing channelId');

        let pagedResult = new PagedResult<Transcript>();
        let channelFolder = this.getChannelFolder(channelId);
        return fs.exists(channelFolder).then(exists => {
            if (!exists) return pagedResult;
            return fs.readdir(channelFolder)
                .then(dirs => {
                    let items = [];
                    if (continuationToken) {
                        items = dirs
                            .filter(skipWhileExpression(di => di != continuationToken))
                            .slice(1, FileTranscriptStore.PageSize + 1);
                    } else {
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
                })
        });
    }

    /**
     * Delete a specific conversation and all of it's activities.
     * @param channelId Channel Id where conversation took place.
     * @param conversationId Id of the conversation to delete.
     */
    deleteTranscript(channelId: string, conversationId: string): Promise<void> {
        if (!channelId)
            throw new Error('Missing channelId');

        if (!conversationId)
            throw new Error('Missing conversationId');

        let transcriptFolder = this.getTranscriptFolder(channelId, conversationId);
        return new Promise((resolve) =>
            rimraf(transcriptFolder, () => resolve()));
    }

    private saveActivity(activity: Activity, transcriptPath: string, activityFilename: string): Promise<void> {
        let json = JSON.stringify(activity, null, '\t');
        return this.ensureFolder(transcriptPath).then(() => {
            return fs.writeFile(path.join(transcriptPath, activityFilename), json, 'utf8');
        })
    }

    private ensureFolder(path: string): Promise<void> {
        return fs.exists(path).then(exists => {
            if (!exists) return fs.mkdirp(path);
        });
    }

    private getActivityFilename(activity: Activity): string {
        return `${getTicks(activity.timestamp)}-${this.sanitizeKey(activity.id)}.json`;
    }

    private getChannelFolder(channelId: string): string {
        return path.join(this.rootFolder, this.sanitizeKey(channelId));
    }

    private getTranscriptFolder(channelId: string, conversationId: string): string {
        return path.join(this.rootFolder, this.sanitizeKey(channelId), this.sanitizeKey(conversationId));
    }

    private sanitizeKey(key: string) {
        return filenamify(key);
    }
}

/**
 * @private
 * The number of .net ticks at the unix epoch.
 */
const epochTicks = 621355968000000000;

/**
 * @private
 * There are 10000 .net ticks per millisecond.
 */
const ticksPerMillisecond = 10000;

/**
 * @private
 * @param timestamp 
 */
const getTicks = (timestamp: Date): string => {
    let ticks = epochTicks + (timestamp.getTime() * ticksPerMillisecond);
    return ticks.toString(16);
}

/**
 * @private
 * @param ticks 
 */
const readDate = (ticks) => {
    let t = Math.round((parseInt(ticks, 16) - epochTicks) / ticksPerMillisecond);
    return new Date(t);
}

/**
 * @private
 * @param date 
 */
const withDateFilter = (date: Date) => {
    if (!date) return () => true;
    return (filename) => {
        let ticks = filename.split('-')[0];
        return readDate(ticks) >= date;
    }
}

/**
 * @private
 * @param continuationToken 
 */
const withContinuationToken = (continuationToken: string) => {
    if (!continuationToken) return () => true;

    return skipWhileExpression(fileName => {
        var id = fileName.substring(fileName.indexOf('-') + 1, fileName.indexOf('.'));
        return id !== continuationToken;
    });
}

/**
 * @private
 * @param expression 
 */
const skipWhileExpression = (expression) => {
    let skipping = true;
    return (item) => {
        if (!skipping) return true;
        if (!expression(item)) {
            skipping = false;
        }
        return !skipping;
    };
}

/**
 * @private
 * @param json 
 */
const parseActivity = (json: string): Activity => {
    let activity: Activity = JSON.parse(json);
    activity.timestamp = new Date(activity.timestamp);
    return activity;
}