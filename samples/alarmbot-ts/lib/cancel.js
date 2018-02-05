"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function begin(context) {
    // Cancel the current topic
    if (context.state.conversation.topic) {
        context.state.conversation.topic = undefined;
        context.reply(`Ok... Canceled.`);
    }
    else {
        context.reply(`Nothing to cancel.`);
    }
    return Promise.resolve();
}
exports.begin = begin;
//# sourceMappingURL=cancel.js.map