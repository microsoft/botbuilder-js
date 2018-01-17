import { MessageStyler } from 'botbuilder-core';
import * as menu from './menu';

export const topicName = 'attachmentPrompt';

// Called by the menu
export function startTopic(context: BotContext) {
    context.state.conversation.activeTopic = { name: topicName };
    context.reply(`Attachment Prompt:\n\nYour bot can wait on the user to upload an image or video. Send me an image and I'll send it back to you.`);
}

// Called for future messages after the topic has been started
export function continueTopic(context: BotContext) {
    const attachments = context.request.attachments || [];
    if (attachments.length > 0) {
        const msg = MessageStyler.carousel(attachments, `You sent ${attachments.length} attachment(s).`);
        context.reply(msg);
        menu.showMenu(context);
    } else {
        context.reply(`Attachment Prompt:\n\nI didn't get any attachments. Upload an attachment or send "menu" to cancel.`);
    }
}
