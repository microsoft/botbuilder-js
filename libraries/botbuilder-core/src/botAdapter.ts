/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, ConversationReference, ResourceResponse } from 'botframework-schema';
import { makeRevocable } from './internal';
import { Middleware, MiddlewareHandler, MiddlewareSet } from './middlewareSet';
import { TurnContext } from './turnContext';

/**
 * Defines the core behavior of a bot adapter that can connect a bot to a service endpoint.
 *
 * @remarks
 * The bot adapter encapsulates authentication processes and sends activities to and receives
 * activities from the Bot Connector Service. When your bot receives an activity, the adapter
 * creates a turn context object, passes it to your bot application logic, and sends responses
 * back to the user's channel.
 *
 * The adapter processes and directs incoming activities in through the bot middleware pipeline to
 * your bot logic and then back out again. As each activity flows in and out of the bot, each
 * piece of middleware can inspect or act upon the activity, both before and after the bot logic runs.
 * Use the [use](xref:botbuilder-core.BotAdapter.use) method to add [Middleware](xref:botbuilder-core.Middleware)
 * objects to your adapter's middleware collection.
 * 
 * For more information, see the articles on
 * [How bots work](https://docs.microsoft.com/azure/bot-service/bot-builder-basics) and
 * [Middleware](https://docs.microsoft.com/azure/bot-service/bot-builder-concept-middleware).
 */
export abstract class BotAdapter {
    protected middleware: MiddlewareSet = new MiddlewareSet();
    private turnError: (context: TurnContext, error: Error) => Promise<void>;

    /**
     * Asynchronously sends a set of outgoing activities to a channel server.
     * 
     * This method supports the framework and is not intended to be called directly for your code.
     * Use the turn context's [sendActivity](xref:botbuilder-core.TurnContext.sendActivity) or
     * [sendActivities](xref:botbuilder-core.TurnContext.sendActivities) method from your bot code.
     *
     * @param context The context object for the turn.
     * @param activities The activities to send.
     * 
     * @returns An array of [ResourceResponse](xref:)
     * 
     * @remarks
     * The activities will be sent one after another in the order in which they're received. A
     * response object will be returned for each sent activity. For `message` activities this will
     * contain the ID of the delivered message.
     */
    public abstract sendActivities(context: TurnContext, activities: Partial<Activity>[]): Promise<ResourceResponse[]>;

    /**
     * Asynchronously replaces a previous activity with an updated version.
     * 
     * This interface supports the framework and is not intended to be called directly for your code.
     * Use [TurnContext.updateActivity](xref:botbuilder-core.TurnContext.updateActivity) to update
     * an activity from your bot code.
     * 
     * @param context The context object for the turn.
     * @param activity The updated version of the activity to replace.
     * 
     * @remarks
     * Not all channels support this operation. For channels that don't, this call may throw an exception.
     */
    public abstract updateActivity(context: TurnContext, activity: Partial<Activity>): Promise<void>;

    /**
     * Asynchronously deletes an existing activity.
     * 
     * This interface supports the framework and is not intended to be called directly for your code.
     * Use [TurnContext.deleteActivity](xref:botbuilder-core.TurnContext.deleteActivity) to delete
     * an activity from your bot code.
     * 
     * @param context The context object for the turn.
     * @param reference Conversation reference information for the activity to delete.
     * 
     * @remarks
     * Not all channels support this operation. For channels that don't, this call may throw an exception.
     */
    public abstract deleteActivity(context: TurnContext, reference: Partial<ConversationReference>): Promise<void>;

    /**
     * Asynchronously resumes a conversation with a user, possibly after some time has gone by.
     *
     * @param reference A reference to the conversation to continue.
     * @param logic The asynchronous method to call after the adapter middleware runs.
     * 
     * @remarks
     * This is often referred to as a _proactive notification_, the bot can proactively
     * send a message to a conversation or user without waiting for an incoming message.
     * For example, a bot can use this method to send notifications or coupons to a user.
     */
    public abstract continueConversation(
        reference: Partial<ConversationReference>,
        logic: (revocableContext: TurnContext
        ) => Promise<void>): Promise<void>;

    /**
     * Gets or sets an error handler that can catch exceptions in the middleware or application.
     * 
     * @remarks
     * The error handler is called with these parameters:
     * 
     * | Name | Type | Description |
     * | :--- | :--- | :--- |
     * | `context` | [TurnContext](xref:botbuilder-core.TurnContext) | The context object for the turn. |
     * | `error` | `Error` | The Node.js error thrown. |
     */
    public get onTurnError(): (context: TurnContext, error: Error) => Promise<void> {
        return this.turnError;
    }

    public set onTurnError(value: (context: TurnContext, error: Error) => Promise<void>) {
        this.turnError = value;
    }

    /**
     * Adds middleware to the adapter's pipeline.
     * 
     * @param middleware The middleware or middleware handlers to add.
     * 
     * @remarks
     * Middleware is added to the adapter at initialization time.
     * Each turn, the adapter calls its middleware in the order in which you added it.
     */
    public use(...middleware: (MiddlewareHandler|Middleware)[]): this {
        MiddlewareSet.prototype.use.apply(this.middleware, middleware);

        return this;
    }

    /**
     * Starts activity processing for the current bot turn.
     *
     * @param context The context object for the turn.
     * @param next A callback method to run at the end of the pipeline.
     * 
     * @remarks
     * The adapter creates a revokable proxy for the turn context and then calls its middleware in
     * the order in which you added it. If the middleware chain completes without short circuiting,
     * the adapter calls the callback method. If any middleware short circuits, the adapter does not
     * call any of the subsequent middleware or the callback method, and the pipeline short circuits. 
     * 
     * The adapter calls middleware with a `next` parameter, which represents the next step in the
     * pipeline. Middleware should call the `next` method to continue processing without short circuiting.
     *
     * When the turn is initiated by a user activity (reactive messaging), the callback method will
     * be a reference to the bot's turn handler. When the turn is initiated by a call to
     * [continueConversation](xref:botbuilder-core.BotAdapter.continueConversation) (proactive messaging),
     * the callback method is the callback method that was provided in the call.
     */
    protected runMiddleware(context: TurnContext, next: (revocableContext: TurnContext) => Promise<void>): Promise<void> {
        // Wrap context with revocable proxy
        const pContext: {
            proxy: TurnContext;
            revoke(): void;
        } = makeRevocable(context);

        return new Promise((resolve: any, reject: any): void => {
            this.middleware.run(pContext.proxy, () => {
                // Call next with revocable context
                return next(pContext.proxy);
            }).then(resolve, (err: Error) => {
                if (this.onTurnError) {
                    this.onTurnError(pContext.proxy, err)
                        .then(resolve, reject);
                } else {
                    reject(err);
                }
            });
        }).then(() => pContext.revoke(), (err: Error) => {
            pContext.revoke();
            throw err;
        });
    }
}
