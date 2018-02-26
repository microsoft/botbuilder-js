/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, Middleware } from 'botbuilder-core';
import { Storage, StoreItem, StoreItems, calculateChangeHash, StorageKeyFactory } from './storage';


export interface CachedBotState<T extends StoreItem> {
    state: T;
    hash: string;
}

export class BotState<T extends StoreItem = StoreItem> implements Middleware {
    /**
     * Creates a new BotState instance. 
     * @param storage Storage provider to persist the state object to.
     * @param cacheKey Name of the cached entry on the context object. This will be passed to `context.set()` and `context.get()`.
     * @param storageKey Function called anytime the storage key for a given turn needs to be known.
     */
    constructor(protected storage: Storage, protected cacheKey: string, protected storageKey: StorageKeyFactory) { }
    
    public onProcessRequest(context: TurnContext, next: () => Promise<void>): Promise<void> {
        // Read in state, continue execution, and then flush changes on completion of turn.
        return this.read(context, true)
            .then(() => next())
            .then(() => this.write(context));
    }

    /**
     * Reads in and caches the current state object for a turn. 
     * @param context Context for current turn of conversation with the user.
     * @param force (Optional) If `true` the cache will be bypassed and the state will always be read in directly from storage. Defaults to `false`.  
     */
    public read(context: TurnContext, force = false): Promise<T> {

        if (force || !context.has(this.cacheKey)) {
            return Promise.resolve(this.storageKey(context)).then((key) => {
                    return this.storage.read([key]).then((items) => {
                        const state = items[key] || {};
                        const hash = calculateChangeHash(state);
                        context.set(this.cacheKey, { state: state, hash: hash });
                        return state as T;
                    });
                });
        }
        return Promise.resolve(context.get(this.cacheKey) || {});
    }

    /**
     * Writes out the state object if it's been changed.
     * @param context Context for current turn of conversation with the user.
     * @param force (Optional) if `true` the state will always be written out regardless of its change state. Defaults to `false`. 
     */
    public write(context: TurnContext, force = false): Promise<void> {
        let cached = context.get(this.cacheKey);
        if (force || (cached && cached.hash !== calculateChangeHash(cached.state))) {
            return Promise.resolve(this.storageKey(context)).then((key) => {
                if (!cached) { cached = { state: {}, hash: undefined } }
                cached.state.eTag = '*';
                const changes = {} as StoreItems;
                changes[key] = cached.state;
                return this.storage.write(changes).then(() => {
                        // Update change hash and cache
                        cached.hash = calculateChangeHash(cached.state);
                        context.set(this.cacheKey, cached);
                    });
            });
        }
        return Promise.resolve();
    }

    /**
     * Clears the current state object for a turn.
     * @param context Context for current turn of conversation with the user.
     */
    public clear(context: TurnContext): void {
        // We leave the change hash un-touched which will force the cleared state changes to get persisted.
        const cached = context.get(this.cacheKey);
        if (cached) {
            cached.state = {};
            context.set(this.cacheKey, cached);
        }
    }
}
