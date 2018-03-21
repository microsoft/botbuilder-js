import { BotContext } from 'botbuilder';
import { BotStateManager } from './botStateManager';

export async function begin(context: BotContext, state: BotStateManager): Promise<any> {
    // Cancel the current topic
    const conversation = state.conversation(context);
    if (conversation.topic) {
        conversation.topic = undefined;
        await context.sendActivity(`Ok... Canceled.`);
    } else {
        await context.sendActivity(`Nothing to cancel.`);
    }
}