"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const storage_1 = require("./storage");
/**
 * Reads and writes state for your bot to storage. When used as middleware the state will
 * automatically be read in before your bots logic runs and then written back out open
 * completion of your bots logic.
 *
 * | package | middleware |
 * | ------- | :--------: |
 * | botbuilder-core-extensions | yes |
 */
class BotState {
    /**
     * Creates a new BotState instance.
     * @param storage Storage provider to persist the state object to.
     * @param cacheKey Name of the cached entry on the context object. This will be passed to `context.set()` and `context.get()`.
     * @param storageKey Function called anytime the storage key for a given turn needs to be known.
     */
    constructor(storage, cacheKey, storageKey) {
        this.storage = storage;
        this.cacheKey = cacheKey;
        this.storageKey = storageKey;
    }
    onProcessRequest(context, next) {
        // Read in state, continue execution, and then flush changes on completion of turn.
        return this.read(context, true)
            .then(() => next())
            .then(() => this.write(context));
    }
    /**
     * Reads in and caches the current state object for a turn.
     * @param context Context for current turn of conversation with the user.
     * @param force (Optional) If `true` the cache will be bypassed and the state will always be read in directly from storage. Defaults to `false`.
     */
    read(context, force = false) {
        const cached = context.get(this.cacheKey);
        if (force || !cached || !cached.state) {
            return Promise.resolve(this.storageKey(context)).then((key) => {
                return this.storage.read([key]).then((items) => {
                    const state = items[key] || {};
                    const hash = storage_1.calculateChangeHash(state);
                    context.set(this.cacheKey, { state: state, hash: hash });
                    return state;
                });
            });
        }
        return Promise.resolve(cached.state);
    }
    /**
     * Writes out the state object if it's been changed.
     * @param context Context for current turn of conversation with the user.
     * @param force (Optional) if `true` the state will always be written out regardless of its change state. Defaults to `false`.
     */
    write(context, force = false) {
        let cached = context.get(this.cacheKey);
        if (force || (cached && cached.hash !== storage_1.calculateChangeHash(cached.state))) {
            return Promise.resolve(this.storageKey(context)).then((key) => {
                if (!cached) {
                    cached = { state: {}, hash: '' };
                }
                cached.state.eTag = '*';
                const changes = {};
                changes[key] = cached.state;
                return this.storage.write(changes).then(() => {
                    // Update change hash and cache
                    cached.hash = storage_1.calculateChangeHash(cached.state);
                    context.set(this.cacheKey, cached);
                });
            });
        }
        return Promise.resolve();
    }
    /**
     * Clears the current state object for a turn.
     * @param context Context for current turn of conversation with the user.
     */
    clear(context) {
        // We leave the change hash un-touched which will force the cleared state changes to get persisted.
        const cached = context.get(this.cacheKey);
        if (cached) {
            cached.state = {};
            context.set(this.cacheKey, cached);
        }
    }
}
exports.BotState = BotState;
//# sourceMappingURL=botState.js.map