
module.exports = {
    begin(context) {
        // Delete any existing topic
        context.state.conversation.topic = undefined;
    
        // Render alarms to user.
        // - No reply is expected so we don't set a new topic.
        this.renderAlarms(context);
        return Promise.resolve();
    },
    renderAlarms(context) {
        const list = context.state.user.alarms || [];
        if (list.length > 0) {
            let msg = `**Current Alarms**\n\n`;
            let connector = '';
            list.forEach((alarm) => {
                msg += connector + `- ${alarm.title} (${alarm.time})`;
                connector = '\n';
            });
            context.reply(msg);
        } else {
            context.reply(`No alarms found.`);
        }
        return list.length;
    }
};
