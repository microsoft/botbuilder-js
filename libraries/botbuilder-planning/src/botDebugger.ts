/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Storage, TurnContext, BotAdapterSet, BotAdapter, ActivityTypes } from 'botbuilder-core';
import { StoredBotState, Bot } from './bot';

export class BotDebugger extends BotAdapterSet {
    public stateStorage: Storage;

    constructor (stateStorage?: Storage, defaultAdapter?: BotAdapter) {
        super(defaultAdapter);
        this.stateStorage = stateStorage;
    }

    public async loadBotState(context: TurnContext): Promise<StoredBotState> {
        // Get storage keys and read state
        const keys = Bot.getStorageKeys(context);
        return await Bot.loadBotState(this.stateStorage, keys);
    }

    public async saveBotState(context: TurnContext, state: StoredBotState): Promise<void> {
        // Get storage keys and write state
        const keys = Bot.getStorageKeys(context);
        return await Bot.saveBotState(this.stateStorage, keys, state);
    }

    protected async onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
        // Check for debug command from emulator
        let intercept = false;
        const { channelId, type, name, value } = context.activity; 
        if (channelId === 'emulator' && type === ActivityTypes.Event) {
            switch(name) {
                case 'debugger:loadBotState':
                    intercept = true;
                    const state = await this.loadBotState(context);
                    await context.sendActivity({
                        type: ActivityTypes.Trace,
                        valueType: 'https://www.botframework.com/schemas/botState',
                        name: 'BotState',
                        label: 'Bot State',
                        value: state
                    });
                    break;
                case 'debugger:saveBotState':
                    intercept = true;
                    await this.saveBotState(context, value as StoredBotState);
                    break;
            }
        }

        // Continue execution
        if (!intercept) {
            await next();
        }
    }
}