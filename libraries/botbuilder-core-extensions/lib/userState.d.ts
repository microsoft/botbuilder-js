/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BotContext } from 'botbuilder-core';
import { BotState } from './botState';
import { Storage, StoreItem } from './storage';
/**
 * :package: **botbuilder-core-extensions**
 *
 * Reads and writes user state for your bot to storage. When used as middleware the state
 * will automatically be read in before your bots logic runs and then written back out open
 * completion of your bots logic.
 */
export declare class UserState<T extends StoreItem = StoreItem> extends BotState<T> {
    /**
     * Creates a new UserState instance.
     * @param storage Storage provider to persist user state to.
     * @param cacheKey (Optional) name of the cached entry on the context object. A property accessor with this name will also be added to the context object. The default value is 'userState'.
     */
    constructor(storage: Storage, cacheKey?: string);
    /**
     * Returns the storage key for the current user state.
     * @param context Context for current turn of conversation with the user.
     */
    getStorageKey(context: BotContext): string | undefined;
    private extendContext(context);
}
