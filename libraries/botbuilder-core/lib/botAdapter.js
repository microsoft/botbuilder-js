"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const middlewareSet_1 = require("./middlewareSet");
const internal_1 = require("./internal");
/**
 * Abstract base class for all adapter plugins. Adapters manage the communication between the bot
 * and a user over a specific channel, or set of channels.
 */
class BotAdapter {
    constructor() {
        this.middleware = new middlewareSet_1.MiddlewareSet();
    }
    /**
     * Registers middleware handlers(s) with the adapter.
     * @param middleware One or more middleware handlers(s) to register.
     */
    use(...middleware) {
        middlewareSet_1.MiddlewareSet.prototype.use.apply(this.middleware, middleware);
        return this;
    }
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
    runMiddleware(context, next) {
        // Wrap context with revocable proxy
        const pContext = internal_1.makeRevocable(context);
        return this.middleware.run(pContext.proxy, () => {
            // Call next with revocable context
            return next(pContext.proxy);
        }).then(() => {
            // Revoke use of context
            pContext.revoke();
        });
    }
}
exports.BotAdapter = BotAdapter;
//# sourceMappingURL=botAdapter.js.map