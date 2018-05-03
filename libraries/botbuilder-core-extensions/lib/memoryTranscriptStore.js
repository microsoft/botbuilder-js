"use strict";
/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const transcriptLogger_1 = require("./transcriptLogger");
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
            this.channels.set(activity.channelId, channel);
        }
        else {
            channel = this.channels.get(activity.channelId);
        }
        // get conversation transcript
        let transcript;
        if (!channel.has(activity.conversation.id)) {
            transcript = [];
            channel.set(activity.conversation.id, transcript);
        }
        else {
            transcript = channel.get(activity.conversation.id);
        }
        transcript.push(activity);
        return Promise.resolve();
    }
    /**
     * Get activities from the memory transcript store
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
        if (this.channels.has(channelId)) {
            let channel = this.channels.get(channelId);
            if (channel.has(conversationId)) {
                let transcript = channel.get(conversationId);
                if (continuationToken) {
                    pagedResult.items = transcript
                        .sort(timestampSorter)
                        .filter(a => !startDate || a.timestamp >= startDate)
                        .filter(skipWhileExpression(a => a.id !== continuationToken))
                        .slice(1, MemoryTranscriptStore.PageSize + 1);
                }
                else {
                    pagedResult.items = transcript
                        .sort(timestampSorter)
                        .filter(a => !startDate || a.timestamp >= startDate)
                        .slice(0, MemoryTranscriptStore.PageSize);
                }
                if (pagedResult.items.length == MemoryTranscriptStore.PageSize) {
                    pagedResult.continuationToken = pagedResult.items[pagedResult.items.length - 1].id;
                }
            }
        }
        return Promise.resolve(pagedResult);
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
        if (this.channels.has(channelId)) {
            let channel = this.channels.get(channelId);
            if (continuationToken) {
                pagedResult.items = Array.from(channel.entries()).map(kv => ({
                    channelId,
                    id: kv[0],
                    created: getDate(kv[1])
                })).sort(createdSorter)
                    .filter(skipWhileExpression(a => a.id !== continuationToken))
                    .slice(1, MemoryTranscriptStore.PageSize + 1);
            }
            else {
                pagedResult.items = Array.from(channel.entries()).map(kv => ({
                    channelId,
                    id: kv[0],
                    created: getDate(kv[1])
                })).sort(createdSorter)
                    .slice(0, MemoryTranscriptStore.PageSize);
            }
            if (pagedResult.items.length == MemoryTranscriptStore.PageSize) {
                pagedResult.continuationToken = pagedResult.items[pagedResult.items.length - 1].id;
            }
        }
        return Promise.resolve(pagedResult);
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
        if (this.channels.has(channelId)) {
            var channel = this.channels.get(channelId);
            if (channel.has(conversationId)) {
                channel.delete(conversationId);
            }
        }
        return Promise.resolve();
    }
}
MemoryTranscriptStore.PageSize = 20;
exports.MemoryTranscriptStore = MemoryTranscriptStore;
/**
 * @private
 * @param a
 * @param b
 */
const createdSorter = (a, b) => a.created.getTime() - b.created.getTime();
/**
 * @private
 * @param a
 * @param b
 */
const timestampSorter = (a, b) => a.timestamp.getTime() - b.timestamp.getTime();
/**
 * @private
 * @param expression
 */
const skipWhileExpression = (expression) => {
    let skipping = true;
    return (item) => {
        if (!skipping)
            return true;
        if (!expression(item)) {
            skipping = false;
        }
        return !skipping;
    };
};
/**
 * @private
 * @param activities
 */
const getDate = (activities) => {
    if (activities && activities.length > 0) {
        return activities[0].timestamp || new Date(0);
    }
    return new Date(0);
};
//# sourceMappingURL=memoryTranscriptStore.js.map