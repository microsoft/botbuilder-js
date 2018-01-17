const builder = require('botbuilder-core');
const services = require('botbuilder-services');
const restify = require('restify');

// Create server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create adapter
const botFrameworkAdapter = new services.BotFrameworkAdapter({ appId: process.env.MICROSOFT_APP_ID, appPassword: process.env.MICROSOFT_APP_PASSWORD });
server.post('/api/messages', botFrameworkAdapter.listen());

// Initialize bot by passing it adapter
// - Add a logger to monitor bot.
// - Add storage so that we can track conversation & user state.
// - Add a receiver to process incoming activities.
const bot = new builder.Bot(botFrameworkAdapter)
    .use(new builder.ConsoleLogger())
    .use(new builder.MemoryStorage())
    .use(new builder.BotStateManager())
    .onReceive((context) => {
        if (context.request.type === 'message') {
            let count = context.state.conversation.count || 1;
            context.reply(`${count}: You said "${context.request.text}"`);
            context.state.conversation.count = count + 1;
        } else {
            context.reply(`[${context.request.type} event detected]`);
        }
    });