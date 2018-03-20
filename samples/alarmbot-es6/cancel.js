
module.exports = {
    begin(context, state) {
        // Cancel the current topic
        const conversation = state.conversation(context);
        if (conversation.topic) {
            conversation.topic = undefined;
            return context.sendActivity(`Ok... Canceled.`);
        }
        return context.sendActivity(`Nothing to cancel.`);
    }
};