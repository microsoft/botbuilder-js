/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Middleware, TurnContext, ActivityTypes, MemoryStorage, ConversationState } from 'botbuilder-core';

const CONVERSATION_STATE = 'ConversationState';

export class SetTestOptionsMiddleware implements Middleware {
    /**
     * Creates a new SetTestOptionsMiddleware instance.
     */
    constructor() {
    }

    /**
     * Processes an incoming event activity.
     * @param context The context object for this turn.
     * @param next The delegate to call to continue the bot middleware pipeline
     */
    public async onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
        if (context.activity.type === ActivityTypes.Event) {
            if (context.activity.name === 'SetTestOptions') {
                // TODO: conversaitonState is undefined
                let conversationState = context.turnState.get(CONVERSATION_STATE);
                const property = conversationState.createProperty('TestOptions');
                await property.set(context, context.activity.value);
            }
        }
        await next();
    }
}
