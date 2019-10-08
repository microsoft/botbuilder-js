/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Middleware, TurnContext, ActivityTypes } from 'botbuilder-core';
import { InvokeResponse, BotFrameworkInvokeMethods } from './botFrameworkAdapter';
import { ConversationAccount } from 'botbuilder-core';

export class SkillHostMiddleware implements Middleware {

    public async onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
        const {type, name, value} = context.activity;
        if (type == ActivityTypes.Invoke && name.toLowerCase().startsWith('botframework.')) {
            // Invoke method
            let response: InvokeResponse;
            try {
                response = await this.onInvokeMethod(context, name, value);
            } catch (err) {
                response = {
                    status: 500,
                    body: err.toString()
                }
            }

            // Return response
            await context.adapter.sendActivities(context, [{
                type: 'invokeResponse',
                value: response
            }]);
        } else {
            await next();
        }
    }

    protected async onInvokeMethod(context: TurnContext, name: string, args: object): Promise<InvokeResponse> {
        switch (name) {
            case BotFrameworkInvokeMethods.ReplyToActivity:
            case BotFrameworkInvokeMethods.SendToConversation:
                return {
                    status: 200,
                    body: await context.adapter.sendActivities(context, [args['activity']])[0]
                };
            case BotFrameworkInvokeMethods.UpdateActivity:
                await context.adapter.updateActivity(context, args['activity']);
                return { status: 200 };
            case BotFrameworkInvokeMethods.DeleteActivity:
                await context.adapter.deleteActivity(context, {
                    serviceUrl: args['serviceUrl'],
                    conversation: { id: args['conversationId'] } as ConversationAccount,
                    activityId: args['activityId']
                });
                return { status: 200 };
            default:
                return { status: 501, body: 'not implemented' }
        }
    }
}
