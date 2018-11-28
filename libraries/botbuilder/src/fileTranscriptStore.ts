/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as fs from 'async-file';
import { Activity, PagedResult, TranscriptInfo, TranscriptStore } from 'botbuilder-core';
import * as filenamify from 'filenamify';
import * as path from 'path';
import * as rimraf from 'rimraf';

/**
 * The file transcript store stores transcripts in file system with each activity as a file.
 *
 * @remarks
 * This class provides an interface to log all incoming and outgoing activities to the filesystem.
 * It implements the features necessary to work alongside the TranscriptLoggerMiddleware plugin.
 * When used in concert, your bot will automatically log all conversations.
 *
 * Below is the boilerplate code needed to use this in your app:
 * ```javascript
 * const { FileTranscriptStore, TranscriptLoggerMiddleware } = require('botbuilder');
 *
 * adapter.use(new TranscriptLoggerMiddleware(new FileTranscriptStore(__dirname + '/transcripts/')));
 * ```
 */
export class FileTranscriptStore implements TranscriptStore {

    private static readonly PageSize: number = 20;

    private rootFolder: string;

    /**
     * Creates an instance of FileTranscriptStore.
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
    public logActivity(activity: Activity): void | Promise<void> {
        if (!activity) {
            throw new Error('activity cannot be null for logActivity()');
        }

        const conversationFolder: string = this.getTranscriptFolder(activity.channelId, activity.conversation.id);
        const activityFileName: string = this.getActivityFilename(activity);

        return this.saveActivity(activity, conversationFolder, activityFileName);
    }

    /**
     * Get all activities associated with a conversation id (aka get the transcript).
     * @param channelId Channel Id.
     * @param conversationId Conversation Id.
     * @param continuationToken (Optional) Continuation token to page through results.
     * @param startDate (Optional) Earliest time to include.
     */
    public getTranscriptActivities(
        channelId: string,
        conversationId: string,
        continuationToken?: string,
        startDate?: Date
    ): Promise<PagedResult<Activity>> {
        if (!channelId) { throw new Error('Missing channelId'); }

        if (!conversationId) { throw new Error('Missing conversationId'); }

        const pagedResult: PagedResult<Activity> = { items: [], continuationToken: undefined };
        const transcriptFolder: string = this.getTranscriptFolder(channelId, conversationId);

        return fs.exists(transcriptFolder).then((exists: boolean) => {
            if (!exists) { return pagedResult; }

            return fs.readdir(transcriptFolder)
                .then((files: string[]) => files
                    .filter((f: string) => f.endsWith('.json'))     // .json only
                    .sort()                                         // sorted
                    .filter(withDateFilter(startDate)))             // >= startDate
                .then((files: string[]) => {                        // get proper page
                    if (continuationToken) {
                        return files
                            .filter(withContinuationToken(continuationToken))
                            .slice(1, FileTranscriptStore.PageSize + 1);
                    } else {
                        return files.slice(0, FileTranscriptStore.PageSize);
                    }
                })
                .then((files: string[]) => files.map((activityFilename: string) =>
                    fs.readFile(path.join(transcriptFolder, activityFilename), 'utf8')))
                .then((reads: any[]) => Promise.all(reads))
                .then((jsons: string[]) => {
                    const items: Activity[] = jsons.map(parseActivity);
                    pagedResult.items = items;
                    if (pagedResult.items.length === FileTranscriptStore.PageSize) {
                        pagedResult.continuationToken = pagedResult.items[pagedResult.items.length - 1].id;
                    }

                    return pagedResult;
                });
        });
    }

    /**
     * List all the logged conversations for a given channelId.
     * @param channelId Channel Id.
     * @param continuationToken (Optional) Continuation token to page through results.
     */
    public listTranscripts(channelId: string, continuationToken?: string): Promise<PagedResult<TranscriptInfo>> {
        if (!channelId) { throw new Error('Missing channelId'); }

        const pagedResult: PagedResult<TranscriptInfo> = { items: [], continuationToken: undefined };
        const channelFolder: string = this.getChannelFolder(channelId);

        return fs.exists(channelFolder).then((exists: boolean) => {
            if (!exists) { return pagedResult; }

            return fs.readdir(channelFolder)
                .then((dirs: string[]) => {
                    let items: string[] = [];
                    if (continuationToken) {
                        items = dirs
                            .filter(skipWhileExpression((di: string) => di !== continuationToken))
                            .slice(1, FileTranscriptStore.PageSize + 1);
                    } else {
                        items = dirs.slice(0, FileTranscriptStore.PageSize);
                    }

                    pagedResult.items = items.map((i: string) => ({
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
     * Delete a conversation and all of it's activities.
     * @param channelId Channel Id where conversation took place.
     * @param conversationId Id of the conversation to delete.
     */
    public deleteTranscript(channelId: string, conversationId: string): Promise<void> {
        if (!channelId) { throw new Error('Missing channelId'); }

        if (!conversationId) { throw new Error('Missing conversationId'); }

        const transcriptFolder: string = this.getTranscriptFolder(channelId, conversationId);

        return new Promise((resolve: any): void =>
            rimraf(transcriptFolder, resolve));
    }

    private saveActivity(activity: Activity, transcriptPath: string, activityFilename: string): Promise<void> {
        const json: string = JSON.stringify(activity, null, '\t');

        return this.ensureFolder(transcriptPath).then(() => {
            return fs.writeFile(path.join(transcriptPath, activityFilename), json, 'utf8');
        });
    }

    // tslint:disable-next-line:no-shadowed-variable
    private ensureFolder(path: string): Promise<void> {
        return fs.exists(path).then((exists: boolean) => {
            if (!exists) { return fs.mkdirp(path); }
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

    private sanitizeKey(key: string): string {
        return filenamify(key);
    }
}

/**
 * @private
 * The number of .net ticks at the unix epoch.
 */
const epochTicks: number = 621355968000000000;

/**
 * @private
 * There are 10000 .net ticks per millisecond.
 */
const ticksPerMillisecond: number = 10000;

/**
 * @private
 * @param timestamp A date used to calculate future ticks.
 */
function getTicks(timestamp: Date): string {
    const ticks: number = epochTicks + (timestamp.getTime() * ticksPerMillisecond);

    return ticks.toString(16);
}

/**
 * @private
 * @param ticks A string containing ticks.
 */
function readDate(ticks: string): Date {
    const t: number = Math.round((parseInt(ticks, 16) - epochTicks) / ticksPerMillisecond);

    return new Date(t);
}

/**
 * @private
 * @param date A date used to create a filter.
 */
function withDateFilter(date: Date): any {
    if (!date) { return (): boolean => true; }

    return (filename: string): boolean => {
        const ticks: string = filename.split('-')[0];

        return readDate(ticks) >= date;
    };
}

/**
 * @private
 * @param continuationToken A continuation token.
 */
function withContinuationToken(continuationToken: string): any {
    if (!continuationToken) { return (): boolean => true; }

    return skipWhileExpression((fileName: string): boolean => {
        const id: string = fileName.substring(fileName.indexOf('-') + 1, fileName.indexOf('.'));

        return id !== continuationToken;
    });
}

/**
 * @private
 * @param expression A function that will be used to test items.
 */
function skipWhileExpression(expression: any): any {
    let skipping: boolean = true;

    return (item: any): boolean => {
        if (!skipping) { return true; }
        if (!expression(item)) {
            skipping = false;
        }

        return !skipping;
    };
}

/**
 * @private
 * @param json A JSON string to be parsed into an activity.
 */
function parseActivity(json: string): Activity {
    const activity: Activity = JSON.parse(json);
    activity.timestamp = new Date(activity.timestamp);

    return activity;
}
