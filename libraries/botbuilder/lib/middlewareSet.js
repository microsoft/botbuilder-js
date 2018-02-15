"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A set of `Middleware` plugins. The set itself is middleware so you can easily package up a set
 * of middleware that can be composed into a bot with a single `bot.use(mySet)` call or even into
 * another middleware set using `set.use(mySet)`.
 */
class MiddlewareSet {
    constructor() {
        this._middleware = [];
    }
    /**
     * Returns the underlying array of middleware.
     */
    get middleware() {
        return this._middleware;
    }
    /**
     * Registers middleware plugin(s) with the bot or set.
     *
     * @param middleware One or more middleware plugin(s) to register.
     */
    use(...middleware) {
        Array.prototype.push.apply(this._middleware, middleware);
        return this;
    }
    contextCreated(context, next) {
        function callMiddleware(set, i) {
            try {
                if (i < set.length) {
                    const plugin = set[i];
                    if (plugin.contextCreated !== undefined) {
                        return plugin.contextCreated(context, () => callMiddleware(set, i + 1));
                    }
                    else {
                        return callMiddleware(set, i + 1);
                    }
                }
                else {
                    return next();
                }
            }
            catch (err) {
                return Promise.reject(err);
            }
        }
        return callMiddleware(this._middleware.slice(0), 0);
    }
    receiveActivity(context, next) {
        function callMiddleware(set, i) {
            try {
                if (i < set.length) {
                    const plugin = set[i];
                    if (plugin.receiveActivity !== undefined) {
                        return plugin.receiveActivity(context, () => callMiddleware(set, i + 1));
                    }
                    else {
                        return callMiddleware(set, i + 1);
                    }
                }
                else {
                    return next();
                }
            }
            catch (err) {
                return Promise.reject(err);
            }
        }
        return callMiddleware(this._middleware.slice(0), 0);
    }
    postActivity(context, activities, next) {
        function callMiddleware(set, i) {
            try {
                if (i < set.length) {
                    const plugin = set[i];
                    if (plugin.postActivity !== undefined) {
                        return plugin.postActivity(context, activities, () => callMiddleware(set, i + 1));
                    }
                    else {
                        return callMiddleware(set, i + 1);
                    }
                }
                else {
                    return next();
                }
            }
            catch (err) {
                return Promise.reject(err);
            }
        }
        return callMiddleware(this._middleware.slice(0), 0);
    }
}
exports.MiddlewareSet = MiddlewareSet;
//# sourceMappingURL=middlewareSet.js.map