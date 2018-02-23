"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Returns true if a result that can (Optionally) be a Promise looks like a Promise.
 * @param result The result to test.
 */
function isPromised(result) {
    return result && result.then !== undefined;
}
exports.isPromised = isPromised;
/**
 * A set of `Middleware` plugins. The set itself is middleware so you can easily package up a set
 * of middleware that can be composed into a bot with a single `bot.use(mySet)` call or even into
 * another middleware set using `set.use(mySet)`.
 */
class MiddlewareSet {
    constructor() {
        this.middleware = [];
    }
    /**
     * Registers middleware handlers(s) with the set.
     * @param middleware One or more middleware handlers(s) to register.
     */
    use(...middleware) {
        Array.prototype.push.apply(this.middleware, middleware);
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
// TODO: move out to toybox
function parallel(...middleware) {
    return (context, next) => {
        // Clone middleware list
        const handlers = middleware.slice();
        // Await consensus before calling next()
        // - We need to wait for all plugins to call their inner next() before we call the 
        //   outer next. To do that we count down the number of calls to next() and return
        //   a promise (pNext) which will block them while we count.
        // - We also need to listen for plugins that complete without calling next
        let awaiting = handlers.length;
        let eNext;
        const pNext = new Promise((resolve, reject) => {
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
        function handlerError(err) {
            handlerCompleted();
            return err;
        }
        // Execute all handlers and get array or promises to wait on.
        const promises = handlers.map((handler) => {
            try {
                return Promise.resolve(handler(context, handlerNext)).then(handlerCompleted, handlerError);
            }
            catch (err) {
                return Promise.reject(err);
            }
        });
        // Wait for all promises to resolve before continuing
        return Promise.all(promises).then(() => next());
    };
}
//# sourceMappingURL=middlewareSet.js.map