/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Middleware, TurnContext, Activity } from "botbuilder-core";
/**
 * When added, this middleware will log incoming and outgoing activities to a ITranscriptStore.
 */
export declare class TranscriptLoggerMiddleware implements Middleware {
    private logger;
    private transcript;
    /**
     * Middleware for logging incoming and outgoing activities to a transcript store.
     * @param logger Transcript logger
     */
    constructor(logger: TranscriptLogger);
    /**
     * Initialization for middleware turn.
     * @param context Context for the current turn of conversation with the user.
     * @param next Function to call at the end of the middleware chain.
     */
    onTurn(context: TurnContext, next: () => Promise<void>): void | Promise<void>;
    /**
     * Logs the Activity.
     * @param activity Activity to log.
     */
    private logActivity(activity);
    /**
     * Clones the Activity entity.
     * @param activity Activity to clone.
     */
    private cloneActivity(activity);
}
/**
 * ConsoleTranscriptLogger , writes activities to Console output.
 */
export declare class ConsoleTranscriptLogger implements TranscriptLogger {
    /**
     * Log an activity to the transcript.
     * @param activity Activity being logged.
     */
    logActivity(activity: Activity): void | Promise<void>;
}
/**
 * Transcript logger stores activities for conversations for recall.
 */
export interface TranscriptLogger {
    /**
     * Log an activity to the transcript.
     * @param activity Activity being logged.
     */
    logActivity(activity: Activity): void | Promise<void>;
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
    getTranscriptActivities(channelId: string, conversationId: string, continuationToken?: string, startDate?: Date): Promise<PagedResult<Activity>>;
    /**
     * List conversations in the channelId.
     * @param channelId Channel Id.
     * @param continuationToken Continuatuation token to page through results.
     */
    listTranscripts(channelId: string, continuationToken?: string): Promise<PagedResult<Transcript>>;
    /**
     * Delete a specific conversation and all of it's activities.
     * @param channelId Channel Id where conversation took place.
     * @param conversationId Id of the conversation to delete.
     */
    deleteTranscript(channelId: string, conversationId: string): Promise<void>;
}
/**
 * Metadata for a stored transcript.
 */
export declare class Transcript {
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
export declare class PagedResult<T> {
    /**
     * Page of items.
     */
    items: T[];
    /**
     * Token used to page through multiple pages.
     */
    continuationToken: string;
}
