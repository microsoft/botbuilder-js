/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, ResourceResponse } from 'botframework-schema';
import { TurnContext } from './turnContext';

/**
 * Type signature for a return value that can (Optionally) return its value
 * asynchronously using a Promise.
 * @param T (Optional) type of value being returned. This defaults to `void`.
 */
export type Promiseable <T = void> = Promise<T>|T;

/**
 * Returns true if a result that can (Optionally) be a Promise looks like a Promise.
 * @param result The result to test.
 */
export function isPromised <T>(result: Promiseable<T>): result is Promise<T> {
    return result && (result as Promise<T>).then !== undefined;
}

export interface Middleware {
    onProcessRequest(context: TurnContext, next: () => Promise<void>): Promiseable<void>;
}

export type MiddlewareHandler = (context: TurnContext, next: () => Promise<void>) => Promiseable<void>;

/**
 * A set of `Middleware` plugins. The set itself is middleware so you can easily package up a set
 * of middleware that can be composed into a bot with a single `bot.use(mySet)` call or even into
 * another middleware set using `set.use(mySet)`.
 */
export class MiddlewareSet {
    private middleware: MiddlewareHandler[] = [];

    /**
     * Registers middleware handlers(s) with the set.
     * @param middleware One or more middleware handlers(s) to register.
     */
    public use(...middleware: (MiddlewareHandler|Middleware)[]): this {
        (middleware || []).forEach((plugin) => {
            if (typeof plugin === 'function') {
                this.middleware.push(plugin);
            } else if (typeof plugin === 'object' && plugin.onProcessRequest) {
                this.middleware.push((context, next) => plugin.onProcessRequest(context, next));
            } else {
                throw new Error(`MiddlewareSet.use(): invalid plugin type being added.`);
            }
        });
        return this;
    }

    /**
     * Executes a set of middleware in series.
     * @param context Context for the current turn of conversation with the user.
     * @param next Function to invoke at the end of the middleware chain.
     */
    public run(context: TurnContext, next: () => Promiseable<void>): Promise<void> {
        const handlers = this.middleware.slice();
        function runNext(i: number): Promise<void> {
            try {
                if (i < handlers.length) {
                    return Promise.resolve(handlers[i](context, () => runNext(i + 1)));
                } else {
                    return Promise.resolve(next());
                }
            } catch (err) {
                return Promise.reject(err);
            }
        }
        return runNext(0);
    }
}

// TODO: move out to toybox
function parallel(...middleware: MiddlewareHandler[]): MiddlewareHandler {
    return (context, next) => {
        // Clone middleware list
        const handlers = middleware.slice();

        // Await consensus before calling next()
        // - We need to wait for all plugins to call their inner next() before we call the 
        //   outer next. To do that we count down the number of calls to next() and return
        //   a promise (pNext) which will block them while we count.
        // - We also need to listen for plugins that complete without calling next
        let awaiting = handlers.length; 
        let eNext: { resolve: () => Promiseable<void>; reject: (err: Error) => void };
        const pNext = new Promise<void>((resolve, reject) =>{ 
            eNext = { resolve: resolve, reject: reject }; 
        });
        function handlerNext() {
            if (awaiting > 0 && --awaiting == 0) {
                next().then(() => {
                    eNext.resolve();
                }, (err) => {
                    eNext.reject(err);
                });
            }
            return pNext;
        }
        function handlerCompleted() {
            if (awaiting > 0) {
                awaiting = 0;
                eNext.resolve();
            }
        }
        function handlerError(err: Error) {
            handlerCompleted();
            return err;
        }

        // Execute all handlers and get array or promises to wait on.
        const promises = handlers.map((handler) => {
            try {
                return Promise.resolve(handler(context, handlerNext)).then(handlerCompleted, handlerError);
            } catch(err) {
                return Promise.reject(err);
            }
        });

        // Wait for all promises to resolve before continuing
        return Promise.all(promises).then(() => next());
    };
}
