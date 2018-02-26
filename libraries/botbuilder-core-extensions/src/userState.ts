/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, Middleware } from 'botbuilder-core';
import { BotState, CachedBotState } from './botState';
import { Storage, StoreItem } from './storage';

const DEFAULT_CHACHE_KEY = 'userState';
const NOT_INSTALLED = `UserState: state not found. Ensure UserState middleware is added to adapter.`;
const NO_KEY = `UserState: channelId and/or conversation missing from context.request.`;

export class UserState<T extends StoreItem = StoreItem> extends BotState<T> {
    /**
     * Creates a new UserState instance. 
     * @param storage Storage provider to persist user state to.
     * @param cacheKey (Optional) name of the cached entry on the context object. The default value is 'userState'.
     */
    constructor(storage: Storage, cacheKey?: string) { 
        super(storage, cacheKey || DEFAULT_CHACHE_KEY, (context) => {
            const key = UserState.key(context);
            if (key) {
                return Promise.resolve(key);
            }
            return  Promise.reject(new Error(NO_KEY)); 
        });
    }

    /**
     * Returns the current user state for a turn.
     * @param context Context for current turn of conversation with the user.
     * @param cacheKey (Optional) name of the cached entry on the context object. The default value is 'userState'.
     */
    static get<T extends StoreItem>(context: TurnContext, cacheKey?: string): T {
        if (!context.has(cacheKey || DEFAULT_CHACHE_KEY)) { throw new Error(NOT_INSTALLED) }
        return context.get<CachedBotState<T>>(cacheKey || DEFAULT_CHACHE_KEY).state;
    }

    /**
     * Returns the storage key for the current user state.
     * @param context Context for current turn of conversation with the user.
     */
    static key(context: TurnContext): string|undefined {
        const req = context.request;
        const channelId = req.channelId;
        const userId = req && req.from && req.from.id ? req.from.id : undefined;
        return channelId && userId ? `user/${channelId}/${userId}` : undefined;
    }
}
