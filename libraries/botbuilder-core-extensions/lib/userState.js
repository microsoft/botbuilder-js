"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botState_1 = require("./botState");
const NOT_CACHED = `UserState: state not found. Ensure UserState middleware is added to adapter or that UserState.read() has been called.`;
const NO_KEY = `UserState: channelId and/or conversation missing from context.request.`;
/**
 * :package: **botbuilder-core-extensions**
 *
 * Reads and writes user state for your bot to storage. When used as middleware the state
 * will automatically be read in before your bots logic runs and then written back out open
 * completion of your bots logic.
 */
class UserState extends botState_1.BotState {
    /**
     * Creates a new UserState instance.
     * @param storage Storage provider to persist user state to.
     */
    constructor(storage) {
        super(storage, (context) => {
            // Calculate storage key
            const key = this.getStorageKey(context);
            return key ? Promise.resolve(key) : Promise.reject(new Error(NO_KEY));
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
}
exports.UserState = UserState;
//# sourceMappingURL=userState.js.map