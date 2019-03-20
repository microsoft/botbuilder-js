/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Storage, TurnContext, BotAdapterSet, BotAdapter, ActivityTypes, Activity, ConversationReference } from 'botbuilder-core';
import { StoredBotState, Bot } from './bot';

export interface BotDebuggerCommand {
    name: string;
    relatesTo: Partial<ConversationReference>;
    value?: any; 
}

export class BotDebugger extends BotAdapterSet {
    public stateStorage: Storage;

    constructor (stateStorage?: Storage, defaultAdapter?: BotAdapter) {
        super(defaultAdapter);
        this.stateStorage = stateStorage;
    }

    public async loadBotState(reference: Partial<ConversationReference>): Promise<StoredBotState> {
        // Get storage keys and read state
        const keys = Bot.getStorageKeysForReference(reference);
        return await Bot.loadBotState(this.stateStorage, keys);
    }

    public async saveBotState(reference: Partial<ConversationReference>, state: StoredBotState): Promise<void> {
        // Get storage keys and write state
        const keys = Bot.getStorageKeysForReference(reference);
        return await Bot.saveBotState(this.stateStorage, keys, state);
    }

    protected async onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
        const { channelId, type, name, value } = context.activity; 

        // Check for debugging mode
        const log: Partial<Activity>[] = [];
        const debugging = channelId === 'emulator' || await this.inDebugSession(context);
        if (debugging) {
            // Check for debug commands from emulator
            if (type === ActivityTypes.Event && name === 'debuggerCommand') {
                const command: BotDebuggerCommand = value;
                const relatesTo = command.relatesTo;
                switch (command.name) {
                    case 'loadBotState':
                        const state = await this.loadBotState(relatesTo);
                        await context.sendActivity(this.trace(state, 'https://www.botframework.com/schemas/botState', 'BotState', 'Bot State'));
                        break;
                    case 'saveBotState':
                        await this.saveBotState(relatesTo, command.value as StoredBotState);
                        break;
                }
                return;
            }

            // Log all activities and changes
            // - We don't need to do this for the emulator as its already seeing everything
            if (channelId !== 'emulator') {
                // Log incoming activity
                log.push(this.trace(Object.assign({}, context.activity), 'https://www.botframework.com/schemas/activity', 'ReceivedActivity', 'Received Activity'));

                // Log ougoing activities and changes
                context.onSendActivities((ctx, activities, next) => {
                    activities.forEach((activity) => {
                        log.push(this.trace(Object.assign({}, activity), 'https://www.botframework.com/schemas/activity', 'SentActivity', 'Sent Activity'));
                    })
                    return next();
                });
                context.onUpdateActivity((ctx, activity, next) => {
                    const updated = Object.assign({}, activity);
                    updated.type = ActivityTypes.MessageUpdate;
                    log.push(this.trace(updated, 'https://www.botframework.com/schemas/activity', 'MessageUpdate', 'Updated Message'));
                    return next();
                });
                context.onDeleteActivity((ctx, reference, next) => {
                    const deleted: Partial<Activity> = {
                        type: ActivityTypes.MessageDelete,
                        id: reference.activityId
                    };
                    log.push(this.trace(deleted, 'https://www.botframework.com/schemas/activity', 'MessageDelete', 'Deleted Message'));
                    return next();
                });
            }
        }

        // Execute turn
        try {
            await next();
        } catch(err) {
            // Log error
            if (debugging) {
                log.push(this.trace({ message: err.toString() }, 'https://www.botframework.com/schemas/error', 'TurnError', 'Turn Error'));
            }
            throw err;
        } finally {
            // Dump debug info to emulator
            if (debugging) {
                // Append snapshot of turns final bot state to log
                let state = context.turnState.get(Bot.BotStateSnapshotKey);
                if (!state) {
                    state = this.loadBotState(TurnContext.getConversationReference(context.activity));
                }
                log.push(this.trace(state, 'https://www.botframework.com/schemas/botState', 'BotState', 'Bot State'));

                // Send log to emulator
                await this.sendToEmulator(context, log);
            }
        }
    }

    protected async inDebugSession(context: TurnContext): Promise<boolean> {
        // TODO: implement logic to detect that you're in a debug session.
        return false;
    }

    protected async getEmulatorSession(context: TurnContext): Promise<ConversationReference> {
        // TODO: implement logic to get the reference for the emulator session you should log to. 
        return undefined;
    }

    protected createEmulatorContext(session: ConversationReference): TurnContext {
        // Get emulators adapter
        const emulator = this.findAdapter('emulator');
        if (!emulator) { throw new Error(`BotDebugger: Cannot log debug activity to emulator. Adapter not found.`) }

        // Create request with session address
        const request = TurnContext.applyConversationReference({ 
            type: ActivityTypes.Event,
            name: 'debuggerSession'
        }, session);

        // Return context for session
        return new TurnContext(emulator, request);
    }

    protected async sendToEmulator(context: TurnContext, log: Partial<Activity>[]): Promise<void> {
        // Get emulator session for current conversation
        const session = await this.getEmulatorSession(context);

        // Create context object for debug session
        const emulatorContext = this.createEmulatorContext(session);

        // Dump log to emulator
        await emulatorContext.sendActivities(log);
    }

    private trace(value: any, valueType: string, name: string, label: string): Partial<Activity> {
        return {
            type: ActivityTypes.Trace,
            timestamp: new Date(),
            name: name,
            label: label,
            value: value,
            valueType: valueType
        };
    }
}