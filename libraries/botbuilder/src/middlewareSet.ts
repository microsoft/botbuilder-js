/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, ResourceResponse } from 'botframework-schema';
import { Middleware } from './middleware';

/**
 * A set of `Middleware` plugins. The set itself is middleware so you can easily package up a set
 * of middleware that can be composed into a bot with a single `bot.use(mySet)` call or even into
 * another middleware set using `set.use(mySet)`.
 */
export class MiddlewareSet implements Middleware {
    private _middleware: Middleware[] = [];

    /**
     * Returns the underlying array of middleware.
     */
    public get middleware(): Middleware[] {
        return this._middleware;
    }

    /**
     * Registers middleware plugin(s) with the bot or set.
     *
     * @param middleware One or more middleware plugin(s) to register.
     */
    public use(...middleware: Middleware[]): this {
        Array.prototype.push.apply(this._middleware, middleware);
        return this;
    }

    public contextCreated(context: BotContext, next: () => Promise<void>): Promise<void> {
        function callMiddleware(set: Middleware[], i: number): Promise<void> {
            try {
                if (i < set.length) {
                    const plugin = set[i];
                    if (plugin.contextCreated !== undefined) {
                        return plugin.contextCreated(context, () => callMiddleware(set, i + 1))
                    } else {
                        return callMiddleware(set, i + 1);
                    }
                } else {
                    return next();
                }
            } catch(err) {
                return Promise.reject(err);
            }
        }
        return callMiddleware(this._middleware.slice(0), 0);
    }

    public receiveActivity(context: BotContext, next: () => Promise<void>): Promise<void> {
        function callMiddleware(set: Middleware[], i: number): Promise<void> {
            try {
                if (i < set.length) {
                    const plugin = set[i];
                    if (plugin.receiveActivity !== undefined) {
                        return plugin.receiveActivity(context, () => callMiddleware(set, i + 1))
                    } else {
                        return callMiddleware(set, i + 1);
                    }
                } else {
                    return next();
                }
            } catch(err) {
                return Promise.reject(err);
            }
        }
        return callMiddleware(this._middleware.slice(0), 0);
    }

    public postActivity(context: BotContext, activities: Partial<Activity>[], next: () => Promise<ResourceResponse[]>): Promise<ResourceResponse[]> {
        function callMiddleware(set: Middleware[], i: number): Promise<ResourceResponse[]> {
            try {
                if (i < set.length) {
                    const plugin = set[i];
                    if (plugin.postActivity !== undefined) {
                        return plugin.postActivity(context, activities, () => callMiddleware(set, i + 1))
                    } else {
                        return callMiddleware(set, i + 1);
                    }
                } else {
                    return next();
                }
            } catch (err) {
                return Promise.reject(err);
            }
        }
        return callMiddleware(this._middleware.slice(0), 0);
    }
}
