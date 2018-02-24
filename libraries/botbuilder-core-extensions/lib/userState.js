"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const storage_1 = require("./storage");
const CACHED_STATE = 'microsoft.botbuilder.userState';
const CACHED_HASH = 'microsoft.botbuilder.userState.hash';
const NOT_INSTALLED = `ConversationState: state not found. Ensure conversationState() middleware is added to adapter.`;
const NO_KEY = `ConversationState: channelId and/or conversation missing from context.request.`;
class UserState {
    constructor(storage) {
        this.storage = storage;
    }
    onProcessRequest(context, next) {
        // Ensure that we can calculate a key
        const key = UserState.key(context);
        if (key !== undefined) {
            // Read in state, continue execution, and then flush changes on completion of turn.
            return this.read(context, true)
                .then(() => next())
                .then(() => this.write(context));
        }
        return Promise.reject(new Error(NO_KEY));
    }
    /**
     * Reads in and caches the current user state for a turn.
     * @param context Context for current turn of conversation with the user.
     * @param force (Optional) If `true` the cache will be bypassed and the state will always be read in directly from storage. Defaults to `false`.
     */
    read(context, force = false) {
        if (force || !context.has(CACHED_STATE)) {
            const key = UserState.key(context);
            if (key) {
                return this.storage.read([key]).then((items) => {
                    const state = items[key] || {};
                    const hash = storage_1.calculateChangeHash(state);
                    context.set(CACHED_STATE, state);
                    context.set(CACHED_HASH, hash);
                    return state;
                });
            }
            return Promise.reject(new Error(NO_KEY));
        }
        return Promise.resolve(context.get(CACHED_STATE) || {});
    }
    /**
     * Writes out the user state if it's been changed.
     * @param context Context for current turn of conversation with the user.
     * @param force (Optional) if `true` the state will always be written out regardless of its change state. Defaults to `false`.
     */
    write(context, force = false) {
        let state = context.get(CACHED_STATE);
        const hash = context.get(CACHED_HASH);
        if (force || (state && hash !== storage_1.calculateChangeHash(state))) {
            const key = UserState.key(context);
            if (key) {
                if (!state) {
                    state = {};
                }
                state.eTag = '*';
                const changes = {};
                changes[key] = state;
                return this.storage.write(changes)
                    .then(() => {
                    // Update stored change hash
                    context.set(CACHED_HASH, storage_1.calculateChangeHash(state));
                });
            }
            return Promise.reject(new Error(NO_KEY));
        }
        return Promise.resolve();
    }
    /**
     * Clears the current user state for a turn.
     * @param context Context for current turn of conversation with the user.
     */
    clear(context) {
        // We leave the change hash un-touched which will force the cleared state changes to get persisted.  
        context.set(CACHED_STATE, {});
    }
    /**
     * Returns the current user state for a turn.
     * @param context Context for current turn of conversation with the user.
     */
    static get(context) {
        if (!context.has(CACHED_STATE)) {
            throw new Error(NOT_INSTALLED);
        }
        return context.get(CACHED_STATE);
    }
    /**
     * Returns the storage key for the current user state.
     * @param context Context for current turn of conversation with the user.
     */
    static key(context) {
        const req = context.request;
        const channelId = req.channelId;
        const userId = req && req.from && req.from.id ? req.from.id : undefined;
        return channelId && userId ? `user/${channelId}/${userId}` : undefined;
    }
}
exports.UserState = UserState;
//# sourceMappingURL=userState.js.map