
module.exports = {
    begin(context) {
        // Cancel the current topic
        if (context.state.conversation.topic) {
            context.state.conversation.topic = undefined;
            context.reply(`Ok... Canceled.`);
        } else {
            context.reply(`Nothing to cancel.`);
        }
        return Promise.resolve();
    }
};
