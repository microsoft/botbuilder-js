/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BotContext, Middleware, ActivityTypes } from 'botbuilder-core';
import { BotState, CachedBotState } from './botState';
import { Storage, StoreItem } from './storage';

const DEFAULT_CHACHE_KEY = 'conversationState';
const NOT_CACHED = `ConversationState: state not found. Ensure ConversationState middleware is added to adapter or ConversationState.read() has been called.`;
const NO_KEY = `ConversationState: channelId and/or conversation missing from context.request.`;

export class ConversationState<T extends StoreItem = StoreItem> extends BotState<T> {
    /**
     * Creates a new ConversationState instance. 
     * @param storage Storage provider to persist conversation state to.
     * @param cacheKey (Optional) name of the cached entry on the context object. A property accessor with this name will also be added to the context object. The default value is 'conversationState'.
     */
    constructor(storage: Storage, cacheKey?: string) { 
        super(storage, cacheKey || DEFAULT_CHACHE_KEY, (context) => {
            // Calculate storage key
            const key = this.getStorageKey(context);
            if (key) {
                // Extend context object on first access and return key
                this.extendContext(context);
                return Promise.resolve(key);
            }
            return  Promise.reject(new Error(NO_KEY)); 
        });
    }

    /**
     * Returns the storage key for the current conversation state.
     * @param context Context for current turn of conversation with the user.
     */
    public getStorageKey(context: BotContext): string|undefined {
        const req = context.request;
        const channelId = req.channelId;
        const conversationId = req && req.conversation && req.conversation.id ? req.conversation.id : undefined;
        return channelId && conversationId ? `conversation/${channelId}/${conversationId}` : undefined;
    }

    private extendContext(context: BotContext): void {
        const extended = this.cacheKey + '.extended';
        if (!context.get(extended)) {
            context.set(extended, true);

            // Add states property accessor
            const descriptor: PropertyDescriptorMap = {};
            descriptor[this.cacheKey] = {
                get: () => {
                    const cached = context.get(this.cacheKey);
                    if (!cached) { throw new Error(NOT_CACHED) }
                    return cached.state;
                }
            };
            Object.defineProperties(context, descriptor);

            // Listen for outgoing endOfConversation activities
            context.onSendActivities((activities, next) => {
                activities.forEach((activity) => {
                    if (ActivityTypes.EndOfConversation === activity.type) {
                        this.clear(context);
                    }
                });
                return next();
            });
        }
    }
}
