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
 * 
 * ```TypeScript
 * type Promiseable <T = void> = Promise<T>|T;
 * ``` 
 * @param T (Optional) type of value being returned. This defaults to `void`.
 */
export type Promiseable <T = void> = Promise<T>|T;

/** 
 * Interface implemented by object based middleware. 
 */
export interface Middleware {
    onTurn(context: TurnContext, next: () => Promise<void>): Promiseable<void>;
}

/** 
 * Signature implemented by function based middleware. 
 * 
 * ```TypeScript
 * type MiddlewareHandler = (context: TurnContext, next: () => Promise<void>) => Promiseable<void>;
 * ``` 
 */
export type MiddlewareHandler = (context: TurnContext, next: () => Promise<void>) => Promiseable<void>;

/**
 * A set of `Middleware` plugins. 
 * 
 * @remarks
 * The set itself is middleware so you can easily package up a set of middleware that can be composed 
 * into an adapter with a single `adapter.use(mySet)` call or even into another middleware set using 
 * `set.use(mySet)`.
 * 
 * ```JavaScript
 * const { MiddlewareSet } = require('botbuilder');
 * 
 * const set = new MiddlewareSet();
 * set.use(async (context, next) => {
 *    console.log(`Leading Edge`);
 *    await next();
 *    console.log(`Trailing Edge`);
 * });
 * ```
 */
export class MiddlewareSet implements Middleware {
    private middleware: MiddlewareHandler[] = [];

    /**
     * Creates a new MiddlewareSet instance.
     * @param middleware Zero or more middleware handlers(s) to register. 
     */
    constructor(...middleware: (MiddlewareHandler|Middleware)[]) {
        MiddlewareSet.prototype.use.apply(this, middleware);
    }

    public onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
        return this.run(context, next);
    }

    /**
     * Registers middleware handlers(s) with the set.
     * 
     * @remarks
     * This example adds a new piece of middleware to a set:
     *
     * ```JavaScript
     * set.use(async (context, next) => {
     *    console.log(`Leading Edge`);
     *    await next();
     *    console.log(`Trailing Edge`);
     * });
     * ```
     * @param middleware One or more middleware handlers(s) to register.
     */
    public use(...middleware: (MiddlewareHandler|Middleware)[]): this {
        middleware.forEach((plugin) => {
            if (typeof plugin === 'function') {
                this.middleware.push(plugin);
            } else if (typeof plugin === 'object' && plugin.onTurn) {
                this.middleware.push((context, next) => plugin.onTurn(context, next));
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
