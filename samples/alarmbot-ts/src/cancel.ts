
export function begin(context: BotContext): Promise<void> {
    // Cancel the current topic
    if (context.state.conversation.topic) {
        delete context.state.conversation.topic;
        context.reply(`Ok... Canceled.`);
    } else {
        context.reply(`Nothing to cancel.`);
    }
    return Promise.resolve();
}