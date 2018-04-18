"use strict";
/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * The memory transcript store stores transcripts in volatile memory in a Map.
 * Because this uses an unbounded volitile dictionary this should only be used for unit tests or non-production environments.
 */
class MemoryTranscriptStore {
    constructor() {
        this.channels = new Map();
    }
    /**
     * Log an activity to the transcript.
     * @param activity Activity to log.
     */
    logActivity(activity) {
        if (!activity) {
            throw new Error("activity cannot be null for logActivity()");
        }
        // get channel
        let channel;
        if (!this.channels.has(activity.channelId)) {
            channel = new Map();
            this.channels[activity.channelId] = channel;
        }
        else {
            channel = this.channels.get(activity.channelId);
        }
        // get conversation transcript
        let transcript;
        if (!channel.has(activity.conversation.id)) {
            transcript = [];
            channel[activity.conversation.id] = transcript;
        }
        else {
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
    getTranscriptActivities(channelId, conversationId, continuationToken, startDate) {
        throw new Error("Method not implemented.");
    }
    /**
     * List conversations in the channelId.
     * @param channelId Channel Id.
     * @param continuationToken Continuatuation token to page through results.
     */
    listTranscripts(channelId, continuationToken) {
        throw new Error("Method not implemented.");
    }
    /**
     * Delete a specific conversation and all of it's activities.
     * @param channelId Channel Id where conversation took place.
     * @param conversationId Id of the conversation to delete.
     */
    deleteTranscript(channelId, conversationId) {
        throw new Error("Method not implemented.");
    }
}
exports.MemoryTranscriptStore = MemoryTranscriptStore;
//# sourceMappingURL=memoryTranscriptStore.js.map