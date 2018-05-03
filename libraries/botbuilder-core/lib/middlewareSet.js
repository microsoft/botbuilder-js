"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
class MiddlewareSet {
    /**
     * Creates a new MiddlewareSet instance.
     * @param middleware Zero or more middleware handlers(s) to register.
     */
    constructor(...middleware) {
        this.middleware = [];
        MiddlewareSet.prototype.use.apply(this, middleware);
    }
    onTurn(context, next) {
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
    use(...middleware) {
        middleware.forEach((plugin) => {
            if (typeof plugin === 'function') {
                this.middleware.push(plugin);
            }
            else if (typeof plugin === 'object' && plugin.onTurn) {
                this.middleware.push((context, next) => plugin.onTurn(context, next));
            }
            else {
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
    run(context, next) {
        const handlers = this.middleware.slice();
        function runNext(i) {
            try {
                if (i < handlers.length) {
                    return Promise.resolve(handlers[i](context, () => runNext(i + 1)));
                }
                else {
                    return Promise.resolve(next());
                }
            }
            catch (err) {
                return Promise.reject(err);
            }
        }
        return runNext(0);
    }
}
exports.MiddlewareSet = MiddlewareSet;
//# sourceMappingURL=middlewareSet.js.map