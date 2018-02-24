"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const botbuilder_core_1 = require("botbuilder-core");
const storage_1 = require("./storage");
const CACHED_STATE = 'microsoft.botbuilder.conversationState';
const CACHED_HASH = 'microsoft.botbuilder.conversationState.hash';
const NOT_INSTALLED = `ConversationState: state not found. Ensure ConversationState middleware is added to adapter.`;
const NO_KEY = `ConversationState: channelId and/or conversation missing from context.request.`;
class ConversationState {
    constructor(storage) {
        this.storage = storage;
    }
    onProcessRequest(context, next) {
        // Ensure that we can calculate a key
        const key = ConversationState.key(context);
        if (key !== undefined) {
            // Listen for outgoing endOfConversation activities
            context.onSendActivities((activities, next) => {
                activities.forEach((activity) => {
                    if (botbuilder_core_1.ActivityTypes.EndOfConversation === activity.type) {
                        this.clear(context);
                    }
                });
                return next();
            });
            // Read in state, continue execution, and then flush changes on completion of turn.
            return this.read(context, true)
                .then(() => next())
                .then(() => this.write(context));
        }
        return Promise.reject(new Error(NO_KEY));
    }
    /**
     * Reads in and caches the current conversation state for a turn.
     * @param context Context for current turn of conversation with the user.
     * @param force (Optional) If `true` the cache will be bypassed and the state will always be read in directly from storage. Defaults to `false`.
     */
    read(context, force = false) {
        if (force || !context.has(CACHED_STATE)) {
            const key = ConversationState.key(context);
            if (key) {
                return this.storage.read([key]).then((items) => {
                    const state = items[key] || {};
                    const hash = storage_1.calculateChangeHash(state);
                    context.set(CACHED_STATE, state);
                    context.set(CACHED_HASH, hash);
                    return state;
                });
            }
            return Promise.reject(new Error(NO_KEY));
        }
        return Promise.resolve(context.get(CACHED_STATE) || {});
    }
    /**
     * Writes out the conversation state if it's been changed.
     * @param context Context for current turn of conversation with the user.
     * @param force (Optional) if `true` the state will always be written out regardless of its change state. Defaults to `false`.
     */
    write(context, force = false) {
        let state = context.get(CACHED_STATE);
        const hash = context.get(CACHED_HASH);
        if (force || (state && hash !== storage_1.calculateChangeHash(state))) {
            const key = ConversationState.key(context);
            if (key) {
                if (!state) {
                    state = {};
                }
                state.eTag = '*';
                const changes = {};
                changes[key] = state;
                return this.storage.write(changes)
                    .then(() => {
                    // Update stored change hash
                    context.set(CACHED_HASH, storage_1.calculateChangeHash(state));
                });
            }
            return Promise.reject(new Error(NO_KEY));
        }
        return Promise.resolve();
    }
    /**
     * Clears the current conversation state for a turn.
     * @param context Context for current turn of conversation with the user.
     */
    clear(context) {
        // We leave the change hash un-touched which will force the cleared state changes to get persisted.  
        context.set(CACHED_STATE, {});
    }
    /**
     * Returns the current conversation state for a turn.
     * @param context Context for current turn of conversation with the user.
     */
    static get(context) {
        if (!context.has(CACHED_STATE)) {
            throw new Error(NOT_INSTALLED);
        }
        return context.get(CACHED_STATE);
    }
    /**
     * Returns the storage key for the current conversation state.
     * @param context Context for current turn of conversation with the user.
     */
    static key(context) {
        const req = context.request;
        const channelId = req.channelId;
        const conversationId = req && req.conversation && req.conversation.id ? req.conversation.id : undefined;
        return channelId && conversationId ? `convo/${channelId}/${conversationId}` : undefined;
    }
}
exports.ConversationState = ConversationState;
//# sourceMappingURL=conversationState.js.map