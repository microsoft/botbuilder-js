"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
class BotStateManager extends botbuilder_1.BotStateSet {
    constructor(storage) {
        super();
        this._conversation = new botbuilder_1.ConversationState(storage);
        this._user = new botbuilder_1.UserState(storage);
        this.use(this._conversation, this._user);
    }
    user(context) {
        // Get cached user state and ensure initialized
        const user = this._user.get(context);
        if (!user.alarms) {
            user.alarms = [];
        }
        return user;
    }
    conversation(context) {
        // Get cached conversation state
        return this._conversation.get(context);
    }
}
exports.BotStateManager = BotStateManager;
//# sourceMappingURL=botStateManager.js.map