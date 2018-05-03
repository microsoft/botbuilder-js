/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Middleware, TurnContext, Activity, ActivityTypes } from "botbuilder-core";

/**
 * When added, this middleware will log incoming and outgoing activities to a ITranscriptStore.
 */
export class TranscriptLoggerMiddleware implements Middleware {
    private logger: TranscriptLogger;
    private transcript: Activity[] = [];

    /**
     * Middleware for logging incoming and outgoing activities to a transcript store.
     * @param logger Transcript logger
     */
    constructor(logger: TranscriptLogger) {
        if (!logger) {
            throw new Error('TranscriptLoggerMiddleware requires a TranscriptLogger instance.')
        }

        this.logger = logger;
    }

    /**
     * Initialization for middleware turn.
     * @param context Context for the current turn of conversation with the user.
     * @param next Function to call at the end of the middleware chain.
     */
    onTurn(context: TurnContext, next: () => Promise<void>): void | Promise<void> {
        // log incoming activity at beginning of turn
        if (context.activity) {
            if (!context.activity.from.role) {
                context.activity.from.role = 'user';
            }

            this.logActivity(this.cloneActivity(context.activity));
        }

        // hook up onSend pipeline
        context.onSendActivities((ctx, activities, next) => {
            // run full pipeline
            let responses = next();
            activities.forEach(a => this.logActivity(this.cloneActivity(a)));
            return responses;
        });

        // hook up update activity pipeline
        context.onUpdateActivity((ctx, activity, next) => {
            // run full pipeline
            let response = next();

            // add Message Update activity
            let updateActivity = this.cloneActivity(activity);
            updateActivity.type = ActivityTypes.MessageUpdate;
            this.logActivity(updateActivity);
            return response;
        });

        // hook up delete activity pipeline
        context.onDeleteActivity((ctx, reference, next) => {
            // run full pipeline
            next();

            // add MessageDelete activity
            // log as MessageDelete activity
            let deleteActivity = TurnContext.applyConversationReference(
                {
                    type: ActivityTypes.MessageDelete,
                    id: reference.activityId
                }, reference, false);

            this.logActivity(<Activity>deleteActivity);
        });

        // process bot logic
        next().then(() => {
            // flush transcript at end of turn
            while (this.transcript.length > 0) {
                try {
                    var activity = this.transcript.shift();
                    this.logger.logActivity(activity);
                }
                catch (err) {
                    console.error('Transcript logActivity failed', err);
                }
            }
        });
    }

    /**
     * Logs the Activity.
     * @param activity Activity to log.
     */
    private logActivity(activity: Activity): void {
        if (!activity.timestamp) {
            activity.timestamp = new Date();
        }

        this.transcript.push(activity);
    }

    /**
     * Clones the Activity entity.
     * @param activity Activity to clone.
     */
    private cloneActivity(activity: Partial<Activity>): Activity {
        return JSON.parse(JSON.stringify(activity));
    }
}

/**
 * ConsoleTranscriptLogger , writes activities to Console output.
 */
export class ConsoleTranscriptLogger implements TranscriptLogger {
    /**
     * Log an activity to the transcript.
     * @param activity Activity being logged.
     */
    logActivity(activity: Activity): void | Promise<void> {
        if (!activity)
            throw new Error('Activity is required.');

        console.log('Activity Log:', activity);
    }
}

/**
 * Transcript logger stores activities for conversations for recall.
 */
export interface TranscriptLogger {
    /**
     * Log an activity to the transcript.
     * @param activity Activity being logged.
     */
    logActivity(activity: Activity): void | Promise<void>
}

/**
 * Transcript logger stores activities for conversations for recall.
 */
export interface TranscriptStore extends TranscriptLogger {

    /**
     * Get activities for a conversation (Aka the transcript)
     * @param channelId Channel Id.
     * @param conversationId Conversation Id.
     * @param continuationToken Continuatuation token to page through results.
     * @param startDate Earliest time to include.
     */
    getTranscriptActivities(channelId: string, conversationId: string, continuationToken?: string, startDate?: Date): Promise<PagedResult<Activity>>

    /**
     * List conversations in the channelId.
     * @param channelId Channel Id.
     * @param continuationToken Continuatuation token to page through results.
     */
    listTranscripts(channelId: string, continuationToken?: string): Promise<PagedResult<Transcript>>

    /**
     * Delete a specific conversation and all of it's activities.
     * @param channelId Channel Id where conversation took place.
     * @param conversationId Id of the conversation to delete.
     */
    deleteTranscript(channelId: string, conversationId: string): Promise<void>
}

/**
 * Metadata for a stored transcript.
 */
export class Transcript {
    /**
     * ChannelId that the transcript was taken from.
     */
    channelId: string;

    /**
     * Conversation Id.
     */
    id: string;

    /**
     * Date conversation was started.
     */
    created: Date;
}

/**
 * Page of results.
 * @param T type of items being paged in.
 */
export class PagedResult<T> {

    /**
     * Page of items.
     */
    items: T[] = [];

    /**
     * Token used to page through multiple pages.
     */
    continuationToken: string;
}