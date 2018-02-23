/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, MiddlewareHandler, ActivityTypes } from 'botbuilder-core';
import { Storage, StoreItem, StoreItems, calculateChangeHash } from './storage';

const CACHED_STATE = 'microsoft.botbuilder.conversationState';
const CACHED_KEY = 'microsoft.botbuilder.conversationState.key';
const CACHED_HASH = 'microsoft.botbuilder.conversationState.hash';
const CACHED_STORAGE = 'microsoft.botbuilder.conversationState.storage';
const NOT_INSTALLED = `ConversationState: state not found. Ensure conversationState() middleware is added to adapter.`;

export function conversationState(storage: Storage): MiddlewareHandler {
    return (context, next) => {
        // Find key components
        const req = context.request || {};
        const channelId = req.channelId || '';
        const conversationId = req.conversation && req.conversation.id ? req.conversation.id : '';
        if (channelId.length > 0 && conversationId.length) {
            // Read in state
            const key = `convo/${channelId}/${conversationId}`;
            return storage.read([key])
                .then((items) => {
                    // Calculate change hash for state
                    const state = items[key] || {};
                    const changeHash = calculateChangeHash(state);

                    // Save state, key, and storage
                    context.set(CACHED_STATE, state);
                    context.set(CACHED_KEY, key);
                    context.set(CACHED_HASH, changeHash);
                    context.set(CACHED_STORAGE, storage);

                    // Listen for outgoing endOfConversation activities
                    context.onSendActivities((activities, next) => {
                        (activities || []).forEach((activity) => {
                            if (ActivityTypes.EndOfConversation === activity.type) {
                                ConvesationState.clear(context);
                            }
                        });
                        return next();
                    });
                })
                .then(() => next())
                .then(() => {
                    // Check for changes
                    const state: StoreItem = context.get(CACHED_STATE) || {};
                    const changeHash: string = context.get(CACHED_HASH);
                    if (calculateChangeHash(state) !== changeHash) {
                        // Save changes
                        state.eTag = '*';
                        const changes = {} as StoreItems;
                        changes[key] = state;
                        return storage.write(changes);
                    }
                });
        } else {
            return next();
        }
    }
}

export class ConvesationState {
    /**
     * Returns the current conversation state for a turn.
     * @param context Context for current turn of conversation with the user.
     */
    static get<T extends StoreItem>(context: TurnContext): T {
        if (!context.has(CACHED_STATE)) { throw new Error(NOT_INSTALLED) }
        return context.get(CACHED_STATE);
    }

    /**
     * Clears the current conversation state for a turn.
     * @param context Context for current turn of conversation with the user.
     */
    static clear(context: TurnContext) {
        if (!context.has(CACHED_STATE)) { throw new Error(NOT_INSTALLED) }
        context.set(CACHED_STATE, {});
        context.set(CACHED_HASH, '{}');
    }

    /**
     * Reloads the current conversation state for a turn.
     * @param context Context for current turn of conversation with the user.
     */
    static reload(context: TurnContext): Promise<void> {
        if (!context.has(CACHED_KEY) || !context.has(CACHED_STORAGE)) { throw new Error(NOT_INSTALLED) }

        // Read in most recent state
        const key: string = context.get(CACHED_KEY);
        const storage: Storage = context.get(CACHED_STORAGE);
        return storage.read([key]).then((items) => {
            // Cache updated state
            const state = items[key] || {};
            const changeHash = calculateChangeHash(state);
            context.set(CACHED_STATE, state);
            context.set(CACHED_HASH, changeHash);
        });
    }
}
