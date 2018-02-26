/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, Middleware, ActivityTypes } from 'botbuilder-core';
import { BotState, CachedBotState } from './botState';
import { Storage, StoreItem } from './storage';

const DEFAULT_CHACHE_KEY = 'conversationState';
const NOT_INSTALLED = `ConversationState: state not found. Ensure ConversationState middleware is added to adapter.`;
const NO_KEY = `ConversationState: channelId and/or conversation missing from context.request.`;

export class ConversationState<T extends StoreItem = StoreItem> extends BotState<T> {
    /**
     * Creates a new ConversationState instance. 
     * @param storage Storage provider to persist conversation state to.
     * @param cacheKey (Optional) name of the cached entry on the context object. The default value is 'conversationState'.
     */
    constructor(storage: Storage, cacheKey?: string) { 
        super(storage, cacheKey || DEFAULT_CHACHE_KEY, (context) => {
            const key = ConversationState.key(context);
            if (key) {
                return Promise.resolve(key);
            }
            return  Promise.reject(new Error(NO_KEY)); 
        });
    }
    
    public onProcessRequest(context: TurnContext, next: () => Promise<void>): Promise<void> {
        // Listen for outgoing endOfConversation activities
        context.onSendActivities((activities, next) => {
            activities.forEach((activity) => {
                if (ActivityTypes.EndOfConversation === activity.type) {
                    this.clear(context);
                }
            });
            return next();
        });
        return super.onProcessRequest(context, next);
    }

    /**
     * Returns the current conversation state for a turn.
     * @param context Context for current turn of conversation with the user.
     * @param cacheKey (Optional) name of the cached entry on the context object. The default value is 'conversationState'.
     */
    static get<T extends StoreItem>(context: TurnContext, cacheKey?: string): T {
        if (!context.has(cacheKey || DEFAULT_CHACHE_KEY)) { throw new Error(NOT_INSTALLED) }
        return context.get<CachedBotState<T>>(cacheKey || DEFAULT_CHACHE_KEY).state;
    }

    /**
     * Returns the storage key for the current conversation state.
     * @param context Context for current turn of conversation with the user.
     */
    static key(context: TurnContext): string|undefined {
        const req = context.request;
        const channelId = req.channelId;
        const conversationId = req && req.conversation && req.conversation.id ? req.conversation.id : undefined;
        return channelId && conversationId ? `conversation/${channelId}/${conversationId}` : undefined;
    }
}
