"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const storage_1 = require("./storage");
/**
 * :package: **botbuilder-core-extensions**
 *
 * Reads and writes state for your bot to storage. When used as middleware the state will
 * automatically be read in before your bots logic runs and then written back out open
 * completion of your bots logic.
 */
class BotState {
    /**
     * Creates a new BotState instance.
     * @param storage Storage provider to persist the state object to.
     * @param storageKey Function called anytime the storage key for a given turn needs to be known.
     */
    constructor(storage, storageKey) {
        this.storage = storage;
        this.storageKey = storageKey;
        this.stateKey = Symbol('state');
    }
    onTurn(context, next) {
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
        const cached = context.services.get(this.stateKey);
        if (force || !cached || !cached.state) {
            return Promise.resolve(this.storageKey(context)).then((key) => {
                return this.storage.read([key]).then((items) => {
                    const state = items[key] || {};
                    const hash = storage_1.calculateChangeHash(state);
                    context.services.set(this.stateKey, { state: state, hash: hash });
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
        let cached = context.services.get(this.stateKey);
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
                    context.services.set(this.stateKey, cached);
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
        const cached = context.services.get(this.stateKey);
        if (cached) {
            cached.state = {};
            context.services.set(this.stateKey, cached);
        }
    }
    /**
     * Returns a cached state object or undefined if not cached.
     * @param context Context for current turn of conversation with the user.
     */
    get(context) {
        const cached = context.services.get(this.stateKey);
        return typeof cached === 'object' && typeof cached.state === 'object' ? cached.state : undefined;
    }
}
exports.BotState = BotState;
//# sourceMappingURL=botState.js.map