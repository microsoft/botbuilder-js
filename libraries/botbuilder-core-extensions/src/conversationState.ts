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

const NOT_CACHED = `ConversationState: state not found. Ensure ConversationState middleware is added to adapter or ConversationState.read() has been called.`;
const NO_KEY = `ConversationState: channelId and/or conversation missing from context.request.`;

/** 
 * Reads and writes conversation state for your bot to storage. 
 * 
 * @remarks
 * Each conversation your bot has with a user or group will have its own isolated storage object 
 * that can be used to persist conversation tracking information between turns of the conversation.  
 * This state information can be reset at any point by calling [clear()](#clear).
 * 
 * Since the `ConversationState` class derives from `BotState` it can be used as middleware to
 * automatically read and write the bots conversation state for each turn. And it also means it
 * can be passed to a `BotStateSet` middleware instance to be managed in parallel with other state
 * providers.
 *
 * ```JavaScript
 * const { ConversationState, MemoryStorage } = require('botbuilder');
 * 
 * const conversationState = new ConversationState(new MemoryStorage());
 * adapter.use(conversationState);
 *  
 * server.post('/api/messages', (req, res) => {
 *    adapter.processActivity(req, res, async (context) => {
 *       // Get loaded conversation state
 *       const convo = conversationState.get(context);
 * 
 *       // ... route activity ...
 * 
 *    });
 * });
 * ```
 */
export class ConversationState<T extends StoreItem = StoreItem> extends BotState<T> {
    /**
     * Creates a new ConversationState instance. 
     * @param storage Storage provider to persist conversation state to.
     * @param namespace (Optional) namespace to append to storage keys. Defaults to an empty string.
     */
    constructor(storage: Storage, private namespace = '') { 
        super(storage, (context) => {
            // Calculate storage key
            const key = this.getStorageKey(context);
            return key ? Promise.resolve(key) :  Promise.reject(new Error(NO_KEY));
        });
    }

    /**
     * Returns the storage key for the current conversation state.
     * @param context Context for current turn of conversation with the user.
     */
    public getStorageKey(context: TurnContext): string|undefined {
        const activity = context.activity;
        const channelId = activity.channelId;
        const conversationId = activity && activity.conversation && activity.conversation.id ? activity.conversation.id : undefined;
        return channelId && conversationId ? `conversation/${channelId}/${conversationId}/${this.namespace}` : undefined;
    }
}


