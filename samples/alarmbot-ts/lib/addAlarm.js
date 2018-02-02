"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function begin(context) {
    // Set topic and initialize empty alarm
    context.state.conversation.topic = 'addAlarm';
    context.state.conversation.alarm = {};
    return nextField(context);
}
exports.begin = begin;
function routeReply(context) {
    // Handle users reply to prompt
    const utterance = context.request.text.trim();
    switch (context.state.conversation.prompt) {
        case 'title':
            // Validate reply and save to alarm
            if (utterance.length > 2) {
                context.state.conversation.alarm.title = utterance;
            }
            else {
                context.reply(`I'm sorry. Your alarm should have a title at least 3 characters long.`);
            }
            break;
        case 'time':
            // TODO: validate time user replied with
            context.state.conversation.alarm.time = utterance;
            break;
    }
    return nextField(context);
}
exports.routeReply = routeReply;
function nextField(context) {
    // Prompt user for next missing field
    const alarm = context.state.conversation.alarm;
    if (alarm.title === undefined) {
        context.reply(`What would you like to call your alarm?`);
        context.state.conversation.prompt = 'title';
    }
    else if (alarm.time === undefined) {
        context.reply(`What time would you like to set the "${alarm.title}" alarm for?`);
        context.state.conversation.prompt = 'time';
    }
    else {
        // Alarm completed so set alarm.
        const list = context.state.user.alarms || [];
        list.push(alarm);
        context.state.user.alarms = list;
        // TODO: set alarm
        // Notify user and cleanup topic state
        context.reply(`Your alarm named "${alarm.title}" is set for "${alarm.time}".`);
        context.state.conversation.topic = undefined;
        context.state.conversation.alarm = undefined;
        context.state.conversation.prompt = undefined;
    }
    return Promise.resolve();
}
//# sourceMappingURL=addAlarm.js.map