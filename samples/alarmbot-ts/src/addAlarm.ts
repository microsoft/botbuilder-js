import { BotContext } from 'botbuilder';
import { BotStateManager, Alarm } from './botStateManager';

export function begin(context: BotContext, state: BotStateManager): Promise<any> {
    // Set topic and initialize empty alarm
    const conversation = state.conversation(context);
    conversation.topic = 'addAlarm';
    conversation.alarm = {};
    return nextField(context, state);
}

export function routeReply(context: BotContext, state: BotStateManager): Promise<any> {
    // Handle users reply to prompt
    let invalid: string = undefined;
    const conversation = state.conversation(context);
    const utterance = context.request.text.trim();
    switch (conversation.prompt) {
        case 'title':
            // Validate reply and save to alarm
            if (utterance.length > 2) {
                conversation.alarm.title = utterance;
            } else {
                invalid = `I'm sorry. Your alarm should have a title at least 3 characters long.`;
            }
            break;
        case 'time':
            // TODO: validate time user replied with
            conversation.alarm.time = utterance;
            break;
    }

    // Check for invalid prompt
    if (invalid) {
        return context.sendActivity(invalid)
            .then(() => nextField(context, state));
    } else {
        return nextField(context, state);
    }
}

function nextField(context: BotContext, state: BotStateManager): Promise<any> {
    // Prompt user for next missing field
    const conversation = state.conversation(context);
    const alarm = conversation.alarm;
    if (alarm.title === undefined) {
        conversation.prompt = 'title';
        return context.sendActivity(`What would you like to call your alarm?`);
    } else if (alarm.time === undefined) {
        conversation.prompt = 'time';
        return context.sendActivity(`What time would you like to set the "${alarm.title}" alarm for?`);
    } else {
        // Alarm completed so set alarm.
        const user = state.user(context);
        user.alarms.push(alarm as Alarm);

        // TODO: set alarm

        // Notify user and cleanup topic state
        conversation.topic = undefined;
        conversation.alarm = undefined;
        conversation.prompt = undefined;
        return context.sendActivity(`Your alarm named "${alarm.title}" is set for "${alarm.time}".`);
    }
}