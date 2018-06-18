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
 */
export interface CachedBotState<T extends StoreItem> {
    state: T;
    hash: string;
}

/** 
 * Reads and writes state for your bot to storage. 
 * 
 * @remarks
 * The state object will be automatically cached on the context object for the lifetime of the turn 
 * and will only be written to storage if it has been modified.
 * 
 * When a `BotState` instance is used as middleware its state object will be automatically read in 
 * before your bots logic runs and then intelligently written back out upon completion of your bots 
 * logic. Multiple instances can be read and written in parallel using the `BotStateSet` middleware. 
 *
 * ```JavaScript
 * const { BotState, MemoryStorage } = require('botbuilder');
 * 
 * const storage = new MemoryStorage();
 * const botState = new BotState(storage, (context) => 'botState');
 * adapter.use(botState);
 *  
 * server.post('/api/messages', (req, res) => {
 *    adapter.processActivity(req, res, async (context) => {
 *       // Track up time
 *       const state = botState.get(context);
 *       if (!('startTime' in state)) { state.startTime = new Date().getTime() }
 *       state.upTime = new Date().getTime() - state.stateTime;
 * 
 *       // ... route activity ...
 * 
 *    });
 * });
 * ```
 */
export class BotState<T extends StoreItem = StoreItem> implements Middleware {
    private stateKey = Symbol('state');

    /**
     * Creates a new BotState instance. 
     * @param storage Storage provider to persist the state object to.
     * @param storageKey Function called anytime the storage key for a given turn needs to be calculated.
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
     * 
     * @remarks
     * Subsequent reads will return the cached object unless the `force` flag is passed in which 
     * will force the state object to be re-read.
     *
     * ```JavaScript
     * const state = await botState.read(context);
     * ``` 
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
     * Saves the cached state object if it's been changed. 
     * 
     * @remarks
     * If the `force` flag is passed in the cached state object will be saved regardless of 
     * whether its been changed or not and if no object has been cached, an empty object will be 
     * created and then saved.
     * 
     * ```JavaScript
     * await botState.write(context);
     * ``` 
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
     * 
     * @remarks
     * This example shows how to clear a state object:
     * 
     * ```JavaScript
     * botState.clear(context);
     * ``` 
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
     * 
     * @remarks
     * This example shows how to synchronously get an already loaded and cached state object:
     *
     * ```JavaScript
     * const state botState.get(context);
     * ``` 
     * @param context Context for current turn of conversation with the user.
     */
    public get(context: TurnContext): T|undefined {
        const cached = context.services.get(this.stateKey) as CachedBotState<T>;
        return typeof cached === 'object' && typeof cached.state === 'object' ? cached.state : undefined;
    }
}
