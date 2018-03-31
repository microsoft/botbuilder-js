/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, Middleware } from 'botbuilder-core';
import { Storage, StoreItem, StoreItems, calculateChangeHash, StorageKeyFactory } from './storage';


/** 
 * State information cached off the context object by a `BotState` instance.
 * 
 * | package |
 * | ------- |
 * | botbuilder-core-extensions |
 */
export interface CachedBotState<T extends StoreItem> {
    state: T;
    hash: string;
}

/** 
 * :package: **botbuilder-core-extensions**
 * 
 * Reads and writes state for your bot to storage. When used as middleware the state will 
 * automatically be read in before your bots logic runs and then written back out open
 * completion of your bots logic.
 */
export class BotState<T extends StoreItem = StoreItem> implements Middleware {
    private stateKey = Symbol('state');

    /**
     * Creates a new BotState instance. 
     * @param storage Storage provider to persist the state object to.
     * @param storageKey Function called anytime the storage key for a given turn needs to be known.
     */
    constructor(protected storage: Storage, protected storageKey: StorageKeyFactory) { }
    
    public onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
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
        const cached = context.services.get(this.stateKey) as CachedBotState<T>;
        if (force || !cached || !cached.state) {
            return Promise.resolve(this.storageKey(context)).then((key) => {
                    return this.storage.read([key]).then((items) => {
                        const state = items[key] || {};
                        const hash = calculateChangeHash(state);
                        context.services.set(this.stateKey, { state: state, hash: hash });
                        return state as T;
                    });
                });
        }
        return Promise.resolve(cached.state);
    }

    /**
     * Writes out the state object if it's been changed.
     * @param context Context for current turn of conversation with the user.
     * @param force (Optional) if `true` the state will always be written out regardless of its change state. Defaults to `false`. 
     */
    public write(context: TurnContext, force = false): Promise<void> {
        let cached = context.services.get(this.stateKey) as CachedBotState<T>;
        if (force || (cached && cached.hash !== calculateChangeHash(cached.state))) {
            return Promise.resolve(this.storageKey(context)).then((key) => {
                if (!cached) { cached = { state: {} as T, hash: '' } }
                cached.state.eTag = '*';
                const changes = {} as StoreItems;
                changes[key] = cached.state;
                return this.storage.write(changes).then(() => {
                        // Update change hash and cache
                        cached.hash = calculateChangeHash(cached.state);
                        context.services.set(this.stateKey, cached);
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
        const cached = context.services.get(this.stateKey) as CachedBotState<T>;
        if (cached) {
            cached.state = {} as T;
            context.services.set(this.stateKey, cached);
        }
    }

    /**
     * Returns a cached state object or undefined if not cached.
     * @param context Context for current turn of conversation with the user.
     */
    public get(context: TurnContext): T|undefined {
        const cached = context.services.get(this.stateKey) as CachedBotState<T>;
        return typeof cached === 'object' && typeof cached.state === 'object' ? cached.state : undefined;
    }
}
