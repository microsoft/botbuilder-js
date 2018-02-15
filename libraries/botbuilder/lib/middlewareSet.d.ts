/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, ConversationResourceResponse } from 'botbuilder-schema';
import { Middleware } from './middleware';
/**
 * A set of `Middleware` plugins. The set itself is middleware so you can easily package up a set
 * of middleware that can be composed into a bot with a single `bot.use(mySet)` call or even into
 * another middleware set using `set.use(mySet)`.
 */
export declare class MiddlewareSet implements Middleware {
    private _middleware;
    /**
     * Returns the underlying array of middleware.
     */
    readonly middleware: Middleware[];
    /**
     * Registers middleware plugin(s) with the bot or set.
     *
     * @param middleware One or more middleware plugin(s) to register.
     */
    use(...middleware: Middleware[]): this;
    contextCreated(context: BotContext, next: () => Promise<void>): Promise<void>;
    receiveActivity(context: BotContext, next: () => Promise<void>): Promise<void>;
    postActivity(context: BotContext, activities: Partial<Activity>[], next: () => Promise<ConversationResourceResponse[]>): Promise<ConversationResourceResponse[]>;
}
