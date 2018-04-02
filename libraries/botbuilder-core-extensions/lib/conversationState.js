"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botState_1 = require("./botState");
const NOT_CACHED = `ConversationState: state not found. Ensure ConversationState middleware is added to adapter or ConversationState.read() has been called.`;
const NO_KEY = `ConversationState: channelId and/or conversation missing from context.request.`;
/**
 * :package: **botbuilder-core-extensions**
 *
 * Reads and writes conversation state for your bot to storage. When used as middleware the state
 * will automatically be read in before your bots logic runs and then written back out open
 * completion of your bots logic.
 */
class ConversationState extends botState_1.BotState {
    /**
     * Creates a new ConversationState instance.
     * @param storage Storage provider to persist conversation state to.
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
     * Returns the storage key for the current conversation state.
     * @param context Context for current turn of conversation with the user.
     */
    getStorageKey(context) {
        const activity = context.activity;
        const channelId = activity.channelId;
        const conversationId = activity && activity.conversation && activity.conversation.id ? activity.conversation.id : undefined;
        return channelId && conversationId ? `conversation/${channelId}/${conversationId}/${this.namespace}` : undefined;
    }
}
exports.ConversationState = ConversationState;
//# sourceMappingURL=conversationState.js.map