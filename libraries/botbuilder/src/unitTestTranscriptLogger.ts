/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
// import * as fs from 'async-file';
import * as fsx from 'async-file';
import * as filenamify from 'filenamify';
import * as fs from 'fs';
import * as path from 'path';
import { Activity, TranscriptLogger } from '.';

/**
 * The UnitTestTranscriptLogger transcript logger creates .transcript file for each conversation it logs
 *
 * @remarks
 * This class logs all activities for a conversation to a {conversationId}.transcript file 
 * This is useful to create .transcript files for unit tests with the TestAdapter
 *
 * Below is the boilerplate code needed to use this in your app:
 * ```javascript
 * const { UnitTestTranscriptLogger, TranscriptLoggerMiddleware } = require('botbuilder');
 *
 * adapter.use(new TranscriptLoggerMiddleware(new UnitTestTranscriptLogger()));
 * ```
 */
export class UnitTestTranscriptLogger implements TranscriptLogger {

    private folder: string;
    private started = new Set<string>();

    /**
     * Creates an instance of FileTranscriptLogger.
     * @param folder Root folder where transcript will be stored. default is __dirname
     */
    constructor(folder: string = null, private unitTestMode: boolean = true) {
        this.folder = folder || process.cwd();
        
        if (!fs.existsSync(this.folder)) {
            fs.mkdirSync(this.folder);
        }
    }

    /**
     * Log an activity to the transcript.
     * @param activity Activity being logged.
     */
    public async logActivity(activity: Activity): Promise<void> {
        if (!activity) {
            throw new Error('activity cannot be null for logActivity()');
        }

        const transcriptPath: string = this.getTranscriptPath(activity.conversation.id);
        let activities: Activity[] = [];
        if (await fsx.exists(transcriptPath)) {
            if (this.unitTestMode === true && this.started.has(transcriptPath) === false) {
                this.started.add(transcriptPath);
            }
            else {
                const json = await fsx.readFile(transcriptPath, 'utf8');
                activities = JSON.parse(json);
            }
        }
        activities.push(activity);

        const jsonOut = JSON.stringify(activities, null, '\t');

        fs.writeFileSync(transcriptPath, jsonOut, 'utf8');
    }

    private getTranscriptPath(conversationId: string): string {
        return path.join(this.folder, `${this.sanitizeKey(conversationId)}.transcript`);
    }

    private sanitizeKey(key: string): string {
        return filenamify(key);
    }
}

