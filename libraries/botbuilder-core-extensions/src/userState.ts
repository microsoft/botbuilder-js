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
     * @param namespace (Optional) namespace to append to storage keys. Defaults to an empty string.
     */
    constructor(storage: Storage, private namespace = '') { 
        super(storage, (context) => {
            // Calculate storage key
            const key = this.getStorageKey(context);
            return key ? Promise.resolve(key) : Promise.reject(new Error(NO_KEY));
        });
    }

    /**
     * Returns the storage key for the current user state.
     * @param context Context for current turn of conversation with the user.
     */
    public getStorageKey(context: TurnContext): string|undefined {
        const activity = context.activity;
        const channelId = activity.channelId;
        const userId = activity && activity.from && activity.from.id ? activity.from.id : undefined;
        return channelId && userId ? `user/${channelId}/${userId}/${this.namespace}` : undefined;
    }
}
