const { BotFrameworkAdapter } = require('botbuilder');
const restify = require('restify');

// Create server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});

// Create adapter
const adapter = new BotFrameworkAdapter({ 
    appId: process.env.MICROSOFT_APP_ID, 
    appPassword: process.env.MICROSOFT_APP_PASSWORD 
});

// Listen for incoming requests 
server.post('/api/messages/', (req, res) => {
    adapter.processActivity(req, res, (context) => {
        // On "conversationUpdate"-type activities this bot will send a greeting message to users joining the conversation.
        if (context.activity.type === 'conversationUpdate' && context.activity.membersAdded[0].name !== 'Bot') {
            return context.sendActivity(`Hello "${context.activity.membersAdded[0].name}"!`);
        }
        if (context.activity.type === 'message') {
            return context.sendActivity(`Welcome to the conversationUpdate-bot! On a "conversationUpdate"-type activity, this bot will greet new users.`);
        }
    });
});