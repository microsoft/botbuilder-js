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
 * Middleware that will automatically save any state changes at the end of the turn.
 *
 * @remarks
 * The `AutoSaveStateMiddleware` class should be added towards the top of your bot's middleware 
 * stack, before any other components that use state.  Any `BotState` plugins passed to the 
 * constructor will have their `BotState.saveChanges()` method called upon successful completion
 * of the turn.  
 * 
 * This example shows boilerplate code for reading and writing conversation and user state within
 * a bot:
 *
 * ```JavaScript
 * const { AutoSaveStateMiddleware, ConversationState, UserState, MemoryStorage } = require('botbuilder');
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
 *		 // ...make changes to state objects...
 * 		 // ... no need to call userState.saveChanges() or conversationState.saveChanges() anymore!
 *    });
 * });
 * ```
 */
export class AutoSaveStateMiddleware implements Middleware {
    /**
     * Creates a new AutoSaveStateiMiddleware instance.
     * @param botStates One or more BotState plugins to automatically save at the end of the turn.
     */
    constructor(...botStates: BotState[]) {
        this.botStateSet = new BotStateSet();
        if (botStates) {
            for (let botState of botStates) {
                this.botStateSet.add(botState);
            }
        }
    }

    /** 
     * Set of `BotState` plugins being automatically saved. 
     */
    public botStateSet: BotStateSet;

    public async onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
        await next();
        await this.botStateSet.saveAllChanges(context, true);
    }

    /**
     * Adds additional `BotState` plugins to be saved.
     * @param botStates One or more BotState plugins to add.
     */
    public add(...botStates: BotState[]): this {
        botStates.forEach((botstate: BotState) => {
            this.botStateSet.add(botstate);
        });
        return this;
    }

}
