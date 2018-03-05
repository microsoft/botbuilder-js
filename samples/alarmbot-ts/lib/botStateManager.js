"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
class BotStateManager extends botbuilder_1.BotStateSet {
    constructor(storage) {
        super();
        this.conversation = new botbuilder_1.ConversationState(storage);
        this.user = new botbuilder_1.UserState(storage);
        this.use(this.conversation, this.user);
    }
}
exports.BotStateManager = BotStateManager;
//# sourceMappingURL=botStateManager.js.map