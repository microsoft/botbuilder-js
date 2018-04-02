/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, Middleware } from 'botbuilder-core';
import { Storage, StoreItem, StorageKeyFactory } from './storage';
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
export declare class BotState<T extends StoreItem = StoreItem> implements Middleware {
    protected storage: Storage;
    protected storageKey: StorageKeyFactory;
    private stateKey;
    /**
     * Creates a new BotState instance.
     * @param storage Storage provider to persist the state object to.
     * @param storageKey Function called anytime the storage key for a given turn needs to be known.
     */
    constructor(storage: Storage, storageKey: StorageKeyFactory);
    onTurn(context: TurnContext, next: () => Promise<void>): Promise<void>;
    /**
     * Reads in and caches the current state object for a turn.
     * @param context Context for current turn of conversation with the user.
     * @param force (Optional) If `true` the cache will be bypassed and the state will always be read in directly from storage. Defaults to `false`.
     */
    read(context: TurnContext, force?: boolean): Promise<T>;
    /**
     * Writes out the state object if it's been changed.
     * @param context Context for current turn of conversation with the user.
     * @param force (Optional) if `true` the state will always be written out regardless of its change state. Defaults to `false`.
     */
    write(context: TurnContext, force?: boolean): Promise<void>;
    /**
     * Clears the current state object for a turn.
     * @param context Context for current turn of conversation with the user.
     */
    clear(context: TurnContext): void;
    /**
     * Returns a cached state object or undefined if not cached.
     * @param context Context for current turn of conversation with the user.
     */
    get(context: TurnContext): T | undefined;
}
