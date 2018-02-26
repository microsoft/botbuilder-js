/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BotContext, Middleware } from 'botbuilder-core';
import { Storage, StoreItem, StorageKeyFactory } from './storage';
export interface CachedBotState<T extends StoreItem> {
    state: T;
    hash: string;
}
export declare class BotState<T extends StoreItem = StoreItem> implements Middleware {
    protected storage: Storage;
    protected cacheKey: string;
    protected storageKey: StorageKeyFactory;
    /**
     * Creates a new BotState instance.
     * @param storage Storage provider to persist the state object to.
     * @param cacheKey Name of the cached entry on the context object. This will be passed to `context.set()` and `context.get()`.
     * @param storageKey Function called anytime the storage key for a given turn needs to be known.
     */
    constructor(storage: Storage, cacheKey: string, storageKey: StorageKeyFactory);
    onProcessRequest(context: BotContext, next: () => Promise<void>): Promise<void>;
    /**
     * Reads in and caches the current state object for a turn.
     * @param context Context for current turn of conversation with the user.
     * @param force (Optional) If `true` the cache will be bypassed and the state will always be read in directly from storage. Defaults to `false`.
     */
    read(context: BotContext, force?: boolean): Promise<T>;
    /**
     * Writes out the state object if it's been changed.
     * @param context Context for current turn of conversation with the user.
     * @param force (Optional) if `true` the state will always be written out regardless of its change state. Defaults to `false`.
     */
    write(context: BotContext, force?: boolean): Promise<void>;
    /**
     * Clears the current state object for a turn.
     * @param context Context for current turn of conversation with the user.
     */
    clear(context: BotContext): void;
}
