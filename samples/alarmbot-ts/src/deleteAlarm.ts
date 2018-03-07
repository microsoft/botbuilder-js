import { BotContext } from 'botbuilder';
import { BotStateManager } from './botStateManager';
import { renderAlarms } from './showAlarms';

export function begin(context: BotContext, state: BotStateManager): Promise<any> {
    // Delete any existing topic
    const conversation = state.conversation(context);
    conversation.topic = undefined;

    // Render list of topics to user
    return renderAlarms(context, state).then((count) => {
        if (count > 0) {
            // Set topic and prompt user for alarm to delete.
            conversation.topic = 'deleteAlarm';
            return context.sendActivity(`Which alarm would you like to delete?`);
        }
    });
}

export function routeReply(context: BotContext, state: BotStateManager): Promise<any> {
    // Validate users reply and delete alarm
    let deleted = false;
    const title = context.request.text.trim();
    const user = state.user(context);
    for (let i = 0; i < user.alarms.length; i++) {
        if (user.alarms[i].title.toLowerCase() === title.toLowerCase()) {
            user.alarms.splice(i, 1);
            deleted = true;
            break;
        }
    }

    // Notify user of deletion or re-prompt
    if (deleted) {
        state.conversation(context).topic = undefined;
        return context.sendActivity(`Deleted the "${title}" alarm.`);
    }
    return context.sendActivity(`An alarm named "${title}" doesn't exist. Which alarm would you like to delete? Say "cancel" to quit.`)
}
