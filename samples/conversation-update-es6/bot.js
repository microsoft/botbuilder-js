async function conversationUpdateBot(context) {
    // On "conversationUpdate"-type activities this bot will send a greeting message to users joining the conversation.
    if (context.activity.type === 'conversationUpdate' && context.activity.membersAdded[0].name !== 'Bot') {
        await context.sendActivity(`Hello ${context.activity.membersAdded[0].name}!`);
    } else if (context.activity.type === 'message') {
        await context.sendActivity(`Welcome to the conversationUpdate-bot! On a _"conversationUpdate"_-type activity, this bot will greet new users.`);
    }
}

module.exports = conversationUpdateBot;