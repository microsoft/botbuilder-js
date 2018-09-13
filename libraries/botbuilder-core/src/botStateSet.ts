/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BotState } from './botState';
import { TurnContext } from './turnContext';

/**
 * Middleware that will call `read()` and `write()` in parallel on multiple `BotState`
 * instances.
 *
 * @remarks
 * This example shows boilerplate code for reading and writing conversation and user state within
 * a bot:
 *
 * ```JavaScript
 * const {AutoSaveStateMiddleware, ConversationState, UserState, MemoryStorage } = require('botbuilder');
 *
 * const storage = new MemoryStorage();
 * const conversationState = new ConversationState(storage);
 * const userState = new UserState(storage);
 * adapter.use(new AutoSaveStateMiddleware(conversationState, userState));
 *
 * server.post('/api/messages', (req, res) => {
 *    adapter.processActivity(req, res, async (context) => {
 *       // Get state
 *       const convo = await conversationState.get(context);
 *       const user = await userState.get(context);
 *
 *       // ... route activity ...
 *
 *    });
 * });
 * ```
 */
export class BotStateSet {

    /**
     * Creates a new AutoSaveStateiMiddleware instance.
     * @param botStates Zero or more BotState plugins to register.
     */
    public constructor(...botStates: BotState[]) {
        BotStateSet.prototype.add.apply(this, botStates);
    }

    public botStates: BotState[] = [];

    /**
     * Registers `BotState` plugins with the set.
     * @param botStates One or more BotState plugins to register.
     */
    public add(...botStates: BotState[]): this {
        botStates.forEach((botstate: BotState) => {
            if (typeof botstate.load === 'function' && typeof botstate.saveChanges === 'function') {
                this.botStates.push(botstate);
            } else {
                throw new Error(`BotStateSet: a object was added that isn't an instance of BotState.`);
            }
        });

        return this;
    }

    /**
     * Calls `BotState.load()` on all of the BotState plugins in the set.
     *
     * @remarks
     * This will trigger all of the plugins to read in their state in parallel.
     *
     * ```JavaScript
     * await stateSet.readAll(context);
     * ```
     * @param context Context for current turn of conversation with the user.
     * @param force (Optional) If `true` the cache will be bypassed and the state will always be read in directly from storage. Defaults to `false`.
     */
    public async loadAll(context: TurnContext, force: boolean = false): Promise<void> {
        const promises: Promise<any>[] = this.botStates.map((botstate: BotState) => botstate.load(context, force));

        await Promise.all(promises);
        return;
    }

    /**
     * Calls `BotState.saveChanges()` on all of the BotState plugins in the set.
     *
     * @remarks
     * This will trigger all of the plugins to write out their state in parallel.
     *
     * ```JavaScript
     * await stateSet.saveAllChanges(context);
     * ```
     * @param context Context for current turn of conversation with the user.
     * @param force (Optional) if `true` the state will always be written out regardless of its change state. Defaults to `false`.
     */
    public async saveAllChanges(context: TurnContext, force: boolean = false): Promise<void> {
        const promises: Promise<void>[] = this.botStates.map((botstate: BotState) => botstate.saveChanges(context, force));

        await Promise.all(promises);
        return;
    }
}
