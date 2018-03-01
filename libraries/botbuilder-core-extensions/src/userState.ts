/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BotContext, Middleware } from 'botbuilder-core';
import { BotState, CachedBotState } from './botState';
import { Storage, StoreItem } from './storage';

const DEFAULT_CHACHE_KEY = 'userState';
const NOT_CACHED = `UserState: state not found. Ensure UserState middleware is added to adapter or that UserState.read() has been called.`;
const NO_KEY = `UserState: channelId and/or conversation missing from context.request.`;

/** 
 * :package: **botbuilder-core-extensions**
 * 
 * Reads and writes user state for your bot to storage. When used as middleware the state 
 * will automatically be read in before your bots logic runs and then written back out open
 * completion of your bots logic.
 */
export class UserState<T extends StoreItem = StoreItem> extends BotState<T> {
    /**
     * Creates a new UserState instance. 
     * @param storage Storage provider to persist user state to.
     * @param cacheKey (Optional) name of the cached entry on the context object. A property accessor with this name will also be added to the context object. The default value is 'userState'.
     */
    constructor(storage: Storage, cacheKey?: string) { 
        super(storage, cacheKey || DEFAULT_CHACHE_KEY, (context) => {
            // Calculate storage key
            const key = this.getStorageKey(context);
            if (key) {
                // Extend context object on first access and return key
                this.extendContext(context);
                return Promise.resolve(key);
            }
            return  Promise.reject(new Error(NO_KEY)); 
        });
    }

    /**
     * Returns the storage key for the current user state.
     * @param context Context for current turn of conversation with the user.
     */
    public getStorageKey(context: BotContext): string|undefined {
        const req = context.request;
        const channelId = req.channelId;
        const userId = req && req.from && req.from.id ? req.from.id : undefined;
        return channelId && userId ? `user/${channelId}/${userId}` : undefined;
    }

    private extendContext(context: BotContext): void {
        const extended = this.cacheKey + '.extended';
        if (!context.get(extended)) {
            context.set(extended, true);

            // Add states property accessor
            const descriptor: PropertyDescriptorMap = {};
            descriptor[this.cacheKey] = {
                get: () => {
                    const cached = context.get(this.cacheKey);
                    if (!cached) { throw new Error(NOT_CACHED) }
                    return cached.state;
                }
            };
            Object.defineProperties(context, descriptor);
        }
    }
}
