"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function begin(context, state) {
    // Cancel the current topic
    const conversation = state.conversation.get(context);
    if (conversation.topic) {
        conversation.topic = undefined;
        return context.sendActivity(`Ok... Canceled.`);
    }
    return context.sendActivity(`Nothing to cancel.`);
}
exports.begin = begin;
//# sourceMappingURL=cancel.js.map