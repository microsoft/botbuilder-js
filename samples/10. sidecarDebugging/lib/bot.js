"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EmulatorAwareBot {
    /**
     *
     * @param {MemoryStorage} memoryStorage
     */
    constructor(memoryStorage) {
        this.memoryStorage = memoryStorage;
    }
    /**
     * Processes the current turn containing the activity from the user
     *
     * @param {TurnContext} context The context of the current conversation turn.
     */
    async processTurnContext(context) {
        const { activity } = context;
        if (activity.recipient.role !== 'Bot' && activity.text) {
            await context.sendActivity(`I heard: ${activity.text}`);
        }
    }
}
exports.EmulatorAwareBot = EmulatorAwareBot;
//# sourceMappingURL=bot.js.map