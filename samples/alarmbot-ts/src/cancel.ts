import { BotContext } from 'botbuilder';
import { BotStateManager } from './botStateManager';

export function begin(context: BotContext, state: BotStateManager): Promise<any> {
    // Cancel the current topic
    const conversation = state.conversation(context);
    if (conversation.topic) {
        conversation.topic = undefined;
        return context.sendActivity(`Ok... Canceled.`);
    }
    return context.sendActivity(`Nothing to cancel.`);
}