/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext } from 'botbuilder-core';
import { BotState } from './botState';
import { Storage, StoreItem } from './storage';
export declare class UserState<T extends StoreItem = StoreItem> extends BotState<T> {
    /**
     * Creates a new UserState instance.
     * @param storage Storage provider to persist user state to.
     * @param cacheKey (Optional) name of the cached entry on the context object. The default value is 'userState'.
     */
    constructor(storage: Storage, cacheKey?: string);
    /**
     * Returns the current user state for a turn.
     * @param context Context for current turn of conversation with the user.
     * @param cacheKey (Optional) name of the cached entry on the context object. The default value is 'userState'.
     */
    static get<T extends StoreItem>(context: TurnContext, cacheKey?: string): T;
    /**
     * Returns the storage key for the current user state.
     * @param context Context for current turn of conversation with the user.
     */
    static key(context: TurnContext): string | undefined;
}
