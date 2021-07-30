/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ConversationStateKey, Middleware, TurnContext, ActivityTypes } from 'botbuilder-core';

export class SetTestOptionsMiddleware implements Middleware {
    /**
     * Processes an incoming event activity.
     * @param context The context object for this turn.
     * @param next The delegate to call to continue the bot middleware pipeline
     */
    public async onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
        if (context.activity.type === ActivityTypes.Event) {
            if (context.activity.name === 'SetTestOptions') {
                const conversationState = context.turnState.get(ConversationStateKey);
                const property = conversationState.createProperty('TestOptions');
                await property.set(context, context.activity.value);
            }
        }
        await next();
    }
}
