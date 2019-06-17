/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as fs from 'fs-extra';
import { Activity, PagedResult, TranscriptInfo, TranscriptStore } from 'botbuilder-core';
import * as filenamify from 'filenamify';
import * as path from 'path';


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
 * @param fileName The filename containing the timestamp string
 */
function withDateFilter(date: Date, fileName: string): any {
    if (!date) { return true; }

    const ticks: string = fileName.split('-')[0];
    return readDate(ticks) >= date;
}

/**
 * @private
 * @param expression A function that will be used to test items.
 */
function includeWhen(expression: any): any {
    let shouldInclude = false;

    return (item: any): boolean => {
        return shouldInclude || (shouldInclude = expression(item));
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

    private readonly rootFolder: string;

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
    public async logActivity(activity: Activity): Promise<void> {
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
    public async getTranscriptActivities(
        channelId: string,
        conversationId: string,
        continuationToken?: string,
        startDate?: Date
    ): Promise<PagedResult<Activity>> {
        if (!channelId) { throw new Error('Missing channelId'); }

        if (!conversationId) { throw new Error('Missing conversationId'); }

        const pagedResult: PagedResult<Activity> = { items: [], continuationToken: undefined };
        const transcriptFolder: string = this.getTranscriptFolder(channelId, conversationId);

        const exists = await fs.pathExists(transcriptFolder);
        if (!exists) {
        	return pagedResult;
        }

        let transcriptFolderContents = await fs.readdir(transcriptFolder);
        const include = includeWhen(fileName => !continuationToken || path.parse(fileName).name === continuationToken);
        const items = transcriptFolderContents.filter(transcript =>
            transcript.endsWith('.json') &&
			withDateFilter(startDate, transcript) &&
			include(transcript));

        pagedResult.items = await Promise.all(items
            .slice(0, FileTranscriptStore.PageSize)
            .sort()
            .map(async activityFilename => {
                const json = await fs.readFile(path.join(transcriptFolder, activityFilename), 'utf8');
                return parseActivity(json);
            })
        );
        const {length} = pagedResult.items;
        if (length === FileTranscriptStore.PageSize && items[length]) {
            pagedResult.continuationToken = path.parse(items[length]).name;
        }
        return pagedResult;
    }

    /**
     * List all the logged conversations for a given channelId.
     * @param channelId Channel Id.
     * @param continuationToken (Optional) Continuation token to page through results.
     */
    public async listTranscripts(channelId: string, continuationToken?: string): Promise<PagedResult<TranscriptInfo>> {
        if (!channelId) { throw new Error('Missing channelId'); }

        const pagedResult: PagedResult<TranscriptInfo> = { items: [], continuationToken: undefined };
        const channelFolder: string = this.getChannelFolder(channelId);

        const exists = await fs.pathExists(channelFolder);
        if (!exists) {
        	return pagedResult;
        }
        const channels = await fs.readdir(channelFolder);
        const items = channels.filter(includeWhen(di => !continuationToken || di === continuationToken));
        pagedResult.items = items
            .slice(0, FileTranscriptStore.PageSize)
            .map(i => ({channelId: channelId,	id: i,	created: null}));
        const {length} = pagedResult.items;
        if (length === FileTranscriptStore.PageSize && items[length]) {
            pagedResult.continuationToken = items[length];
        }

        return pagedResult;
    }

    /**
     * Delete a conversation and all of it's activities.
     * @param channelId Channel Id where conversation took place.
     * @param conversationId Id of the conversation to delete.
     */
    public async deleteTranscript(channelId: string, conversationId: string): Promise<void> {
        if (!channelId) { throw new Error('Missing channelId'); }

        if (!conversationId) { throw new Error('Missing conversationId'); }

        const transcriptFolder: string = this.getTranscriptFolder(channelId, conversationId);

        return fs.remove(transcriptFolder);
    }

    private async saveActivity(activity: Activity, transcriptPath: string, activityFilename: string): Promise<void> {
        const json: string = JSON.stringify(activity, null, '\t');

        const exists = await fs.pathExists(transcriptPath);
        if (!exists) {
        	await fs.mkdirp(transcriptPath);
        }
        return fs.writeFile(path.join(transcriptPath, activityFilename), json, 'utf8');
    }

    private getActivityFilename(activity: Activity): string {
        return `${ getTicks(activity.timestamp) }-${ this.sanitizeKey(activity.id) }.json`;
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
