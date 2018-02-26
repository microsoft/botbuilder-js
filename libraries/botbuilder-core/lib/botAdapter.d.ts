/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { MiddlewareHandler, Promiseable } from './middlewareSet';
import { Activity, ResourceResponse } from 'botframework-schema';
import { BotContext } from './botContext';
/**
 * Manages all communication between the bot and a user.
 *
 * **Usage Example**
 *
 * ```JavaScript
 * ```
 */
export declare abstract class BotAdapter {
    private middleware;
    /**
     * Sends a set of activities to the user. An array of responses form the server will be
     * returned.
     * @param activities Set of activities being sent.
     */
    abstract sendActivities(activities: Partial<Activity>[]): Promise<ResourceResponse[]>;
    /**
     * Replaces an existing activity.
     * @param activity New replacement activity. The activity should already have it's ID information populated.
     */
    abstract updateActivity(activity: Partial<Activity>): Promise<void>;
    /**
     * Deletes an existing activity.
     * @param id of the activity to delete.
     */
    abstract deleteActivity(id: string): Promise<void>;
    /**
     * Registers middleware handlers(s) with the adapter.
     * @param middleware One or more middleware handlers(s) to register.
     */
    use(...middleware: MiddlewareHandler[]): this;
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
    protected runMiddleware<T extends BotAdapter>(context: BotContext<T>, next: (revocableContext: BotContext<T>) => Promiseable<void>): Promise<void>;
}
