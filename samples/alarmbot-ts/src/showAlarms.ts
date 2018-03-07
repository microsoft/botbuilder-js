import { BotContext } from 'botbuilder';
import { BotStateManager } from './botStateManager';

export function begin(context: BotContext, state: BotStateManager): Promise<any> {
    // Delete any existing topic
    state.conversation(context).topic = undefined;

    // Render alarms to user.
    // - No reply is expected so we don't set a new topic.
    return renderAlarms(context, state);
}

export function renderAlarms(context: BotContext, state: BotStateManager): Promise<number> {
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
    return context.sendActivity(msg)
                  .then(() => user.alarms.length);
}
