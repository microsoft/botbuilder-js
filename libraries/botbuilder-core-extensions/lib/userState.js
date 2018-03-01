"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botState_1 = require("./botState");
const DEFAULT_CHACHE_KEY = 'userState';
const NOT_CACHED = `UserState: state not found. Ensure UserState middleware is added to adapter or that UserState.read() has been called.`;
const NO_KEY = `UserState: channelId and/or conversation missing from context.request.`;
/**
 * Reads and writes user state for your bot to storage. When used as middleware the state
 * will automatically be read in before your bots logic runs and then written back out open
 * completion of your bots logic.
 *
 * | package | middleware |
 * | ------- | :--------: |
 * | botbuilder-core-extensions | yes |
 */
class UserState extends botState_1.BotState {
    /**
     * Creates a new UserState instance.
     * @param storage Storage provider to persist user state to.
     * @param cacheKey (Optional) name of the cached entry on the context object. A property accessor with this name will also be added to the context object. The default value is 'userState'.
     */
    constructor(storage, cacheKey) {
        super(storage, cacheKey || DEFAULT_CHACHE_KEY, (context) => {
            // Calculate storage key
            const key = this.getStorageKey(context);
            if (key) {
                // Extend context object on first access and return key
                this.extendContext(context);
                return Promise.resolve(key);
            }
            return Promise.reject(new Error(NO_KEY));
        });
    }
    /**
     * Returns the storage key for the current user state.
     * @param context Context for current turn of conversation with the user.
     */
    getStorageKey(context) {
        const req = context.request;
        const channelId = req.channelId;
        const userId = req && req.from && req.from.id ? req.from.id : undefined;
        return channelId && userId ? `user/${channelId}/${userId}` : undefined;
    }
    extendContext(context) {
        const extended = this.cacheKey + '.extended';
        if (!context.get(extended)) {
            context.set(extended, true);
            // Add states property accessor
            const descriptor = {};
            descriptor[this.cacheKey] = {
                get: () => {
                    const cached = context.get(this.cacheKey);
                    if (!cached) {
                        throw new Error(NOT_CACHED);
                    }
                    return cached.state;
                }
            };
            Object.defineProperties(context, descriptor);
        }
    }
}
exports.UserState = UserState;
//# sourceMappingURL=userState.js.map