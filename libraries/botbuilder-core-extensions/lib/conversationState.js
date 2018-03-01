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
const botState_1 = require("./botState");
const DEFAULT_CHACHE_KEY = 'conversationState';
const NOT_CACHED = `ConversationState: state not found. Ensure ConversationState middleware is added to adapter or ConversationState.read() has been called.`;
const NO_KEY = `ConversationState: channelId and/or conversation missing from context.request.`;
/**
 * Reads and writes conversation state for your bot to storage. When used as middleware the state
 * will automatically be read in before your bots logic runs and then written back out open
 * completion of your bots logic.
 *
 * | package | middleware |
 * | ------- | :--------: |
 * | botbuilder-core-extensions | yes |
 */
class ConversationState extends botState_1.BotState {
    /**
     * Creates a new ConversationState instance.
     * @param storage Storage provider to persist conversation state to.
     * @param cacheKey (Optional) name of the cached entry on the context object. A property accessor with this name will also be added to the context object. The default value is 'conversationState'.
     */
    constructor(storage, cacheKey) {
        super(storage, cacheKey || DEFAULT_CHACHE_KEY, (context) => {
            // Calculate storage key
            const key = this.getStorageKey(context);
            if (key) {
                // Extend context object on first access and return key
                this.extendContext(context);
                return Promise.resolve(key);
            }
            return Promise.reject(new Error(NO_KEY));
        });
    }
    /**
     * Returns the storage key for the current conversation state.
     * @param context Context for current turn of conversation with the user.
     */
    getStorageKey(context) {
        const req = context.request;
        const channelId = req.channelId;
        const conversationId = req && req.conversation && req.conversation.id ? req.conversation.id : undefined;
        return channelId && conversationId ? `conversation/${channelId}/${conversationId}` : undefined;
    }
    extendContext(context) {
        const extended = this.cacheKey + '.extended';
        if (!context.get(extended)) {
            context.set(extended, true);
            // Add states property accessor
            const descriptor = {};
            descriptor[this.cacheKey] = {
                get: () => {
                    const cached = context.get(this.cacheKey);
                    if (!cached) {
                        throw new Error(NOT_CACHED);
                    }
                    return cached.state;
                }
            };
            Object.defineProperties(context, descriptor);
            // Listen for outgoing endOfConversation activities
            context.onSendActivities((activities, next) => {
                activities.forEach((activity) => {
                    if (botbuilder_core_1.ActivityTypes.EndOfConversation === activity.type) {
                        this.clear(context);
                    }
                });
                return next();
            });
        }
    }
}
exports.ConversationState = ConversationState;
//# sourceMappingURL=conversationState.js.map