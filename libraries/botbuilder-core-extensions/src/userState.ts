/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, Middleware, ActivityTypes } from 'botbuilder-core';
import { Storage, StoreItem, StoreItems, calculateChangeHash } from './storage';

const CACHED_STATE = 'microsoft.botbuilder.userState';
const CACHED_HASH = 'microsoft.botbuilder.userState.hash';
const NOT_INSTALLED = `ConversationState: state not found. Ensure conversationState() middleware is added to adapter.`;
const NO_KEY = `ConversationState: channelId and/or conversation missing from context.request.`;

export class UserState<T extends StoreItem = StoreItem> implements Middleware {
    constructor(private storage: Storage) { }
    
    public onProcessRequest(context: TurnContext, next: () => Promise<void>): Promise<void> {
        // Ensure that we can calculate a key
        const key = UserState.key(context);
        if (key !== undefined) {
            // Read in state, continue execution, and then flush changes on completion of turn.
            return this.read(context, true)
                .then(() => next())
                .then(() => this.write(context));
        } else {
            return Promise.reject(new Error(NO_KEY));
        }
    }

    /**
     * Reads in and caches the current user state for a turn. 
     * @param context Context for current turn of conversation with the user.
     * @param force (Optional) If `true` the cache will be bypassed and the state will always be read in directly from storage. Defaults to `false`.  
     */
    public read(context: TurnContext, force = false): Promise<T> {
        if (force || !context.has(CACHED_STATE)) {
            const key = UserState.key(context);
            if (key) {
                return this.storage.read([key]).then((items) => {
                    const state = items[key] || {};
                    const hash = calculateChangeHash(state);
                    context.set(CACHED_STATE, state);
                    context.set(CACHED_HASH, hash);
                    return state as T;
                });
            } else {
                return Promise.reject(new Error(NO_KEY));
            }
        } else {
            return Promise.resolve(context.get(CACHED_STATE) || {});
        }
    }

    /**
     * Writes out the user state if it's been changed.
     * @param context Context for current turn of conversation with the user.
     * @param force (Optional) if `true` the state will always be written out regardless of its change state. Defaults to `false`. 
     */
    public write(context: TurnContext, force = false): Promise<void> {
        const state = context.get(CACHED_STATE) || {};
        const hash = context.get(CACHED_HASH) || '';
        const newHash = calculateChangeHash(state);
        if (force || hash !== newHash) {
            const key = UserState.key(context);
            if (key) {
                state.eTag = '*';
                const changes = {} as StoreItems;
                changes[key] = state;
                return this.storage.write(changes)
                    .then(() => {
                        // Update stored change hash
                        context.set(CACHED_HASH, newHash);
                    });
            } else {
                return Promise.reject(new Error(NO_KEY));
            }
        } else {
            return Promise.resolve();
        }
    }

    /**
     * Clears the current user state for a turn.
     * @param context Context for current turn of conversation with the user.
     */
    public clear(context: TurnContext): void {
        // We leave the change hash un-touched which will force the cleared state changes to get persisted.  
        context.set(CACHED_STATE, {});
    }

    /**
     * Returns the current user state for a turn.
     * @param context Context for current turn of conversation with the user.
     */
    static get<T extends StoreItem>(context: TurnContext): T {
        if (!context.has(CACHED_STATE)) { throw new Error(NOT_INSTALLED) }
        return context.get(CACHED_STATE);
    }

    /**
     * Returns the storage key for the current user state.
     * @param context Context for current turn of conversation with the user.
     */
    static key(context: TurnContext): string|undefined {
        const req = context.request || {};
        const channelId = req.channelId || '';
        const userId = req.from && req.from.id ? req.from.id : '';
        return channelId.length > 0 && userId.length ? `user/${channelId}/${userId}` : undefined; 
    }
}
