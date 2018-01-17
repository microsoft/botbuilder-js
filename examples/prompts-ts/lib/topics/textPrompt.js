"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const menu = require("./menu");
exports.topicName = 'textPrompt';
// Called by the menu
function startTopic(context) {
    context.state.conversation.activeTopic = { name: exports.topicName };
    context.reply(`Text Prompt:\n\nSend me some text and I'll say it back.`);
}
exports.startTopic = startTopic;
// Called for future messages after the topic has been started
function continueTopic(context) {
    const utterance = context.request.text || '';
    if (utterance.length > 0) {
        context.reply(`You sent "${utterance}".`);
        menu.showMenu(context);
    }
    else {
        context.reply(`Text Prompt:\n\nI didn't get anything. Send me some text or send "menu" to cancel.`);
    }
}
exports.continueTopic = continueTopic;
