import { TurnContext } from './turnContext';
/**
 * :package: **botbuilder-core**
 *
 * Type signature for a return value that can (Optionally) return its value
 * asynchronously using a Promise.
 * @param T (Optional) type of value being returned. This defaults to `void`.
 */
export declare type Promiseable<T = void> = Promise<T> | T;
/**
 * :package: **botbuilder-core**
 *
 * Interface implemented by object based middleware.
 */
export interface Middleware {
    onTurn(context: TurnContext, next: () => Promise<void>): Promiseable<void>;
}
/**
 * :package: **botbuilder-core**
 *
 * Signature implemented by function based middleware.
 */
export declare type MiddlewareHandler = (context: TurnContext, next: () => Promise<void>) => Promiseable<void>;
/**
 * :package: **botbuilder-core**
 *
 * A set of `Middleware` plugins. The set itself is middleware so you can easily package up a set
 * of middleware that can be composed into a bot with a single `bot.use(mySet)` call or even into
 * another middleware set using `set.use(mySet)`.
 */
export declare class MiddlewareSet implements Middleware {
    private middleware;
    /**
     * Creates a new instance of a MiddlewareSet.
     * @param middleware Zero or more middleware handlers(s) to register.
     */
    constructor(...middleware: (MiddlewareHandler | Middleware)[]);
    onTurn(context: TurnContext, next: () => Promise<void>): Promise<void>;
    /**
     * Registers middleware handlers(s) with the set.
     * @param middleware One or more middleware handlers(s) to register.
     */
    use(...middleware: (MiddlewareHandler | Middleware)[]): this;
    /**
     * Executes a set of middleware in series.
     * @param context Context for the current turn of conversation with the user.
     * @param next Function to invoke at the end of the middleware chain.
     */
    run(context: TurnContext, next: () => Promiseable<void>): Promise<void>;
}
