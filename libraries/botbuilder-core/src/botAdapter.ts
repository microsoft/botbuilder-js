/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { MiddlewareSet, MiddlewareHandler, Middleware, Promiseable } from './middlewareSet';
import { ActivityTypes, Activity, ResourceResponse, ConversationReference } from 'botframework-schema';
import { TurnContext } from './turnContext';
import { makeRevocable } from './internal';

/**
 * Abstract base class for all adapter plugins. Adapters manage the communication between the bot 
 * and a user over a specific channel, or set of channels.
 */
export abstract class BotAdapter {
    private middleware = new MiddlewareSet();

    /** 
     * Sends a set of activities to the user. An array of responses form the server will be 
     * returned.
     * @param context Context for the current turn of conversation with the user.
     * @param activities Set of activities being sent.
     */
    public abstract sendActivities(context: TurnContext, activities: Partial<Activity>[]): Promise<ResourceResponse[]>;

    /** 
     * Replaces an existing activity. 
     * @param context Context for the current turn of conversation with the user.
     * @param activity New replacement activity. The activity should already have it's ID information populated. 
     */
    public abstract updateActivity(context: TurnContext, activity: Partial<Activity>): Promise<void>;

    /** 
     * Deletes an existing activity. 
     * @param context Context for the current turn of conversation with the user.
     * @param reference Conversation reference of the activity being deleted.  
     */
    public abstract deleteActivity(context: TurnContext, reference: Partial<ConversationReference>): Promise<void>;

    /**
     * Proactively continues an existing conversation. 
     * @param reference Conversation reference of the conversation being continued.  
     * @param logic Function to execute for performing the bots logic. 
     */
    public abstract continueConversation(reference: Partial<ConversationReference>, logic: (revocableContext: TurnContext) => Promiseable<void>): Promise<void>;

    /**
     * Registers middleware handlers(s) with the adapter.
     * @param middleware One or more middleware handlers(s) to register.
     */
    public use(...middleware: (MiddlewareHandler|Middleware)[]): this {
        MiddlewareSet.prototype.use.apply(this.middleware, middleware);
        return this;
    }

    /**
     * Called by the parent class to run the adapters middleware set and calls the passed in 
     * `next()` handler at the end of the chain.  While the context object is passed in from the 
     * caller is created by the caller, what gets passed to the `next()` is a wrapped version of 
     * the context which will automatically be revoked upon completion of the turn.  This causes
     * the bots logic to throw an error if it tries to use the context after the turn completes.
     * @param context Context for the current turn of conversation with the user.
     * @param next Function to call at the end of the middleware chain.
     * @param next.callback A revocable version of the context object.
     */
    protected runMiddleware(context: TurnContext, next: (revocableContext: TurnContext) => Promiseable<void>): Promise<void> {
        // Wrap context with revocable proxy
        const pContext = makeRevocable(context);
        return this.middleware.run(pContext.proxy, () => {
            // Call next with revocable context
            return next(pContext.proxy);
        }).then(() => {
            // Revoke use of context
            pContext.revoke();
        });
    }
}
