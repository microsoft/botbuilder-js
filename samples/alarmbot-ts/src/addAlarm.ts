import { BotContext } from 'botbuilder';
import { BotStateManager, Alarm } from './botStateManager';

export async function begin(context: BotContext, state: BotStateManager): Promise<any> {
    // Set topic and initialize empty alarm
    const conversation = state.conversation(context);
    conversation.topic = 'addAlarm';
    conversation.alarm = {};
    
    // Prompt for first field
    await nextField(context, state);
}

export async function routeReply(context: BotContext, state: BotStateManager): Promise<any> {
    // Handle users reply to prompt
    const conversation = state.conversation(context);
    const utterance = context.request.text.trim();
    switch (conversation.prompt) {
        case 'title':
            // Validate reply and save to alarm
            if (utterance.length > 2) {
                conversation.alarm.title = utterance;
            } else {
                await context.sendActivity(`I'm sorry. Your alarm should have a title at least 3 characters long.`);
            }
            break;
        case 'time':
            // TODO: validate time user replied with
            conversation.alarm.time = utterance;
            break;
    }

    // Prompt for next field
    await nextField(context, state);
}

async function nextField(context: BotContext, state: BotStateManager): Promise<any> {
    // Prompt user for next missing field
    const conversation = state.conversation(context);
    const alarm = conversation.alarm;
    if (alarm.title === undefined) {
        conversation.prompt = 'title';
        await context.sendActivity(`What would you like to call your alarm?`);
    } else if (alarm.time === undefined) {
        conversation.prompt = 'time';
        await context.sendActivity(`What time would you like to set the "${alarm.title}" alarm for?`);
    } else {
        // Alarm completed so set alarm.
        const user = state.user(context);
        user.alarms.push(alarm as Alarm);

        // TODO: set alarm

        // Notify user and cleanup topic state
        conversation.topic = undefined;
        conversation.alarm = undefined;
        conversation.prompt = undefined;
        await context.sendActivity(`Your alarm named "${alarm.title}" is set for "${alarm.time}".`);
    }
}