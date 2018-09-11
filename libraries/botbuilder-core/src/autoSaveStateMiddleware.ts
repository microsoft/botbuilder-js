/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BotState } from './botState';
import { BotStateSet } from './botStateSet';
import { Middleware } from './middlewareSet';
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
 *       const convo = conversationState.get(context);
 *       const user = userState.get(context);
 *
 *       // ... route activity ...
 *
 *    });
 * });
 * ```
 */
export class AutoSaveStateMiddleware implements Middleware {
    /**
     * Creates a new AutoSaveStateiMiddleware instance.
     * @param botStates Zero or more BotState plugins to register.
     */
    constructor(...botStates: BotState[]) {
        this.botStateSet = new BotStateSet();
        if (botStates) {
            for (let botState of botStates) {
                this.botStateSet.add(botState);
            }
        }
    }

    public botStateSet: BotStateSet;

    public async onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
        await next();
        await this.botStateSet.saveAllChanges(context, true);
    }

    /**
     * Registers `BotState` plugins with the set.
     * @param botStates One or more BotState plugins to register.
     */
    public add(...botStates: BotState[]): this {
        botStates.forEach((botstate: BotState) => {
            this.botStateSet.add(botstate);
        });
        return this;
    }

}
