"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botState_1 = require("./botState");
const DEFAULT_CHACHE_KEY = 'userState';
const NOT_INSTALLED = `UserState: state not found. Ensure UserState middleware is added to adapter.`;
const NO_KEY = `UserState: channelId and/or conversation missing from context.request.`;
class UserState extends botState_1.BotState {
    /**
     * Creates a new UserState instance.
     * @param storage Storage provider to persist user state to.
     * @param cacheKey (Optional) name of the cached entry on the context object. The default value is 'userState'.
     */
    constructor(storage, cacheKey) {
        super(storage, cacheKey || DEFAULT_CHACHE_KEY, (context) => {
            const key = UserState.key(context);
            if (key) {
                return Promise.resolve(key);
            }
            return Promise.reject(new Error(NO_KEY));
        });
    }
    /**
     * Returns the current user state for a turn.
     * @param context Context for current turn of conversation with the user.
     * @param cacheKey (Optional) name of the cached entry on the context object. The default value is 'userState'.
     */
    static get(context, cacheKey) {
        const cached = context.get(cacheKey || DEFAULT_CHACHE_KEY);
        if (!cached) {
            throw new Error(NOT_INSTALLED);
        }
        return cached.state;
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