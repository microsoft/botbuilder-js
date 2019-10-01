/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Middleware, TurnContext, ActivityTypes } from 'botbuilder-core';
import { InvokeResponse } from './botFrameworkAdapter';

export enum ConversationBridgeActions {
    block = 'block',
    forward = 'forward',
    passThrough = 'passThrough'
}

export type ConversationBridgeFilter = (context: TurnContext) => Promise<ConversationBridgeActions>;
export type ConversationBridgeCommand = (context: TurnContext, args: object) => Promise<InvokeResponse>;

export class ConversationBridgeMiddleware implements Middleware {
    protected readonly filter: ConversationBridgeFilter;
    protected readonly commands: { [name: string]: ConversationBridgeCommand; } = {};

    constructor(filter?: ConversationBridgeFilter, allowAdapterCalls = true) {
        // Save custom filter or use default
        this.filter = filter || defaultFilter;

        // Add adapter commands
        if (allowAdapterCalls) {
            this.addCommand('BotAdapter.sendActivities', async (context, args) => {
                const responses = await context.adapter.sendActivities(context, args['activities']); 
                return { status: 200, body: responses };
            });
            this.addCommand('BotAdapter.updateActivity', async (context, args) => {
                await context.adapter.updateActivity(context, args['activity']);
                return { status: 200 };
            });
            this.addCommand('BotAdapter.deleteActivity', async (context, args) => {
                await context.adapter.deleteActivity(context, args['reference']);
                return { status: 200 };
            });
        }
    }

    public async onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
        // Filter incoming activity
        switch (await this.filter(context)) {
            case ConversationBridgeActions.forward:
                if (context.activity.type == ActivityTypes.Invoke) {
                    // Invoke command
                    await this.onInvokeCommand(context);
                } else {
                    // Forward activity
                    await this.onForwardActivity(context);
                }
                break;
            case ConversationBridgeActions.passThrough:
                await next();
                break;
        }
    }

    public addCommand(name: string, command: ConversationBridgeCommand): this {
        this.commands[name.toLowerCase()] = command;
        return this;
    }

    protected async onInvokeCommand(context: TurnContext): Promise<void> {
        // Lookup and invoke command
        // - Commands are always processed as 'invoke' activities
        const activity = context.activity;
        const command = this.commands[activity.name];
        if (command != undefined) {
            const response = await command(context, activity.value);
            await context.sendActivity({ type: 'invokeResponse', value: response });
        } else {
            await context.sendActivity({ type: 'invokeResponse', value: { status: 404 } });
        }
    }

    protected async onForwardActivity(context: TurnContext): Promise<void> {
        // Clone activity and re-address
        const clone = Object.assign({}, context.activity);
        TurnContext.applyConversationReference(clone, clone.relatesTo);
        delete clone.relatesTo;

        // Forward to adapter for delivery
        await context.adapter.sendActivities(context, [clone]);
    }
}

async function defaultFilter(context: TurnContext): Promise<ConversationBridgeActions> {
    const activity = context.activity;
    if (activity.relatesTo != undefined && activity.type != ActivityTypes.EndOfConversation) {
        return ConversationBridgeActions.forward;
    } else {
        return ConversationBridgeActions.passThrough;
    }
}

