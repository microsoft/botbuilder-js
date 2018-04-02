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
     * @param namespace (Optional) namespace to append to storage keys. Defaults to an empty string.
     */
    constructor(storage, namespace = '') {
        super(storage, (context) => {
            // Calculate storage key
            const key = this.getStorageKey(context);
            return key ? Promise.resolve(key) : Promise.reject(new Error(NO_KEY));
        });
        this.namespace = namespace;
    }
    /**
     * Returns the storage key for the current user state.
     * @param context Context for current turn of conversation with the user.
     */
    getStorageKey(context) {
        const activity = context.activity;
        const channelId = activity.channelId;
        const userId = activity && activity.from && activity.from.id ? activity.from.id : undefined;
        return channelId && userId ? `user/${channelId}/${userId}/${this.namespace}` : undefined;
    }
}
exports.UserState = UserState;
//# sourceMappingURL=userState.js.map