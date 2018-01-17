import * as menu from './menu';

export const topicName = 'textPrompt';

// Called by the menu
export function startTopic(context: BotContext) {
    context.state.conversation.activeTopic = { name: topicName };
    context.reply(`Text Prompt:\n\nSend me some text and I'll say it back.`);
}

// Called for future messages after the topic has been started
export function continueTopic(context: BotContext) {
    const utterance = context.request.text || '';
    if (utterance.length > 0) {
        context.reply(`You sent "${utterance}".`);
        menu.showMenu(context);
    } else {
        context.reply(`Text Prompt:\n\nI didn't get anything. Send me some text or send "menu" to cancel.`);
    }
}