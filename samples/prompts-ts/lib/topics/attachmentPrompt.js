"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_core_1 = require("botbuilder-core");
const menu = require("./menu");
exports.topicName = 'attachmentPrompt';
// Called by the menu
function startTopic(context) {
    context.state.conversation.activeTopic = { name: exports.topicName };
    context.reply(`Attachment Prompt:\n\nYour bot can wait on the user to upload an image or video. Send me an image and I'll send it back to you.`);
}
exports.startTopic = startTopic;
// Called for future messages after the topic has been started
function continueTopic(context) {
    const attachments = context.request.attachments || [];
    if (attachments.length > 0) {
        const msg = botbuilder_core_1.MessageStyler.carousel(attachments, `You sent ${attachments.length} attachment(s).`);
        context.reply(msg);
        menu.showMenu(context);
    }
    else {
        context.reply(`Attachment Prompt:\n\nI didn't get any attachments. Upload an attachment or send "menu" to cancel.`);
    }
}
exports.continueTopic = continueTopic;
