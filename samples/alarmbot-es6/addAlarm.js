
module.exports = {
    begin(context, state) {
        // Set topic and initialize empty alarm
        const conversation = state.conversation(context);
        conversation.topic = 'addAlarm';
        conversation.alarm = {};
        return nextField(context, state);
    },
    routeReply(context, state) {
        // Handle users reply to prompt
        let invalid = undefined;
        const conversation = state.conversation(context);
        const utterance = context.activity.text.trim();
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
};

function nextField(context, state) {
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
        user.alarms.push(alarm);

        // TODO: set alarm

        // Notify user and cleanup topic state
        conversation.topic = undefined;
        conversation.alarm = undefined;
        conversation.prompt = undefined;
        return context.sendActivity(`Your alarm named "${alarm.title}" is set for "${alarm.time}".`);
    }
}