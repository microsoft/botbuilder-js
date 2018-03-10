import { BotContext } from 'botbuilder';
import { BotStateManager } from './botStateManager';

export async function begin(context: BotContext, state: BotStateManager): Promise<any> {
    // Delete any existing topic
    state.conversation(context).topic = undefined;

    // Render alarms to user.
    // - No reply is expected so we don't set a new topic.
    await renderAlarms(context, state);
}

export async function renderAlarms(context: BotContext, state: BotStateManager): Promise<number> {
    // Get user state w/alarm list
    const user = state.user(context);

    // Build message
    let msg = `No alarms found.`;
    if (user.alarms.length > 0) {
        msg = `**Current Alarms**\n\n`;
        let connector = '';
        user.alarms.forEach((alarm) => {
            msg += connector + `- ${alarm.title} (${alarm.time})`;
            connector = '\n';
        });
    }

    // Send message to user and return alarm count
    await context.sendActivity(msg);
    return user.alarms.length;
}
