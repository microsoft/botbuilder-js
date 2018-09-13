/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity } from 'botframework-schema';
import { BotState } from './botState';
import { Storage } from './storage';
import { TurnContext } from './turnContext';

const NO_KEY: string = `UserState: channelId and/or conversation missing from context.request.`;

/**
 * Reads and writes user state for your bot to storage.
 *
 * @remarks
 * Each user your bot communicates with will have its own isolated storage object that can be used
 * to persist information about the user across all of the conversation you have with that user.
 *
 * Since the `UserState` class derives from `BotState` it can be used as middleware to automatically
 * read and write the bots user state for each turn. And it also means it can be passed to a
 * `BotStateSet` middleware instance to be managed in parallel with other state providers.
 *
 * ```JavaScript
 * const { UserState, MemoryStorage } = require('botbuilder');
 *
 * const userState = new UserState(new MemoryStorage());
 * adapter.use(userState);
 *
 * server.post('/api/messages', (req, res) => {
 *    adapter.processActivity(req, res, async (context) => {
 *       // Get loaded user state
 *       const user = await userState.get(context);
 *
 *       // ... route activity ...
 *
 *    });
 * });
 * ```
 */
export class UserState extends BotState {
    /**
     * Creates a new UserState instance.
     * @param storage Storage provider to persist user state to.
     * @param namespace (Optional) namespace to append to storage keys. Defaults to an empty string.
     */
    constructor(storage: Storage, private namespace: string = '') {
        super(storage, (context: TurnContext) => {
            // Calculate storage key
            const key: string = this.getStorageKey(context);

            return key ? Promise.resolve(key) : Promise.reject(new Error(NO_KEY));
        });
    }

    /**
     * Returns the storage key for the current user state.
     * @param context Context for current turn of conversation with the user.
     */
    public getStorageKey(context: TurnContext): string | undefined {
        const activity: Activity = context.activity;
        const channelId: string = activity.channelId;
        const userId: string = activity && activity.from && activity.from.id ? activity.from.id : undefined;

        if (!channelId) {
            throw new Error('missing activity.channelId');
        }

        if (!userId) {
            throw new Error('missing activity.from.id');
        }

        return `${channelId}/users/${userId}/${this.namespace}`;
    }
}
