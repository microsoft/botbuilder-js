import { TurnContext } from './turnContext';
/**
 * Type signature for a return value that can (Optionally) return its value
 * asynchronously using a Promise.
 * @param T (Optional) type of value being returned. This defaults to `void`.
 */
export declare type Promiseable<T = void> = Promise<T> | T;
/**
 * Returns true if a result that can (Optionally) be a Promise looks like a Promise.
 * @param result The result to test.
 */
export declare function isPromised<T>(result: Promiseable<T>): result is Promise<T>;
export interface Middleware {
    onProcessRequest(context: TurnContext, next: () => Promise<void>): Promiseable<void>;
}
export declare type MiddlewareHandler = (context: TurnContext, next: () => Promise<void>) => Promiseable<void>;
/**
 * A set of `Middleware` plugins. The set itself is middleware so you can easily package up a set
 * of middleware that can be composed into a bot with a single `bot.use(mySet)` call or even into
 * another middleware set using `set.use(mySet)`.
 */
export declare class MiddlewareSet {
    private middleware;
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
