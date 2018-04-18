/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TranscriptStore, PagedResult, Transcript } from "./transcriptLogger";
import { Activity } from "botbuilder-core";

/**
 * The memory transcript store stores transcripts in volatile memory in a Map.
 * Because this uses an unbounded volitile dictionary this should only be used for unit tests or non-production environments.
 */
export class MemoryTranscriptStore implements TranscriptStore {

    private channels: Map<string, Map<string, Array<Activity>>> = new Map<string, Map<string, Array<Activity>>>();

    /**
     * Log an activity to the transcript.
     * @param activity Activity to log.
     */
    logActivity(activity: Activity): void | Promise<void> {
        if (!activity) {
            throw new Error("activity cannot be null for logActivity()");
        }

        // get channel
        let channel: Map<string, Array<Activity>>;
        if (!this.channels.has(activity.channelId)) {
            channel = new Map<string, Array<Activity>>();
            this.channels[activity.channelId] = channel;
        } else {
            channel = this.channels.get(activity.channelId);
        }

        // get conversation transcript
        let transcript: Array<Activity>;
        if (!channel.has(activity.conversation.id)) {
            transcript = []
            channel[activity.conversation.id] = transcript;
        } else {
            transcript = channel[activity.conversation.id];
        }

        transcript.push(activity);
    }

    /**
     * Get activities from the memory transcript store
     * @param channelId Channel Id.
     * @param conversationId Conversation Id.
     * @param continuationToken Continuatuation token to page through results.
     * @param startDate Earliest time to include.
     */
    getTranscriptActivities(channelId: string, conversationId: string, continuationToken?: string, startDate?: Date): Promise<PagedResult<Activity>> {
        throw new Error("Method not implemented.");
    }

    /**
     * List conversations in the channelId.
     * @param channelId Channel Id.
     * @param continuationToken Continuatuation token to page through results.
     */
    listTranscripts(channelId: string, continuationToken?: string): Promise<PagedResult<Transcript>> {
        throw new Error("Method not implemented.");
    }

    /**
     * Delete a specific conversation and all of it's activities.
     * @param channelId Channel Id where conversation took place.
     * @param conversationId Id of the conversation to delete.
     */
    deleteTranscript(channelId: string, conversationId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}