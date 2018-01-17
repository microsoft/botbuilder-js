const botbuilder = require('botbuilder-core');
const BotFrameworkAdapter = require('botbuilder-services').BotFrameworkAdapter;
const restify = require('restify');

// Create server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});

// Create adapter and listen to our servers '/api/messages' route.
const botFrameworkAdapter = new BotFrameworkAdapter({ 
    appId: process.env.MICROSOFT_APP_ID, 
    appPassword: process.env.MICROSOFT_APP_PASSWORD 
});
server.post('/api/messages', botFrameworkAdapter.listen());

// Initialize bot by passing it adapter
const bot = new botbuilder.Bot(botFrameworkAdapter);
// Initialize middleware stack
bot.use(
    new botbuilder.ConsoleLogger(), 
    new botbuilder.MemoryStorage(), 
    new botbuilder.BotStateManager()
);

// Define bot helper functions
function delayEcho(conversationReference, messageText, delayInMilliseconds) {
    setTimeout(() => {
        // Create a context object for the reference
        bot.createContext(conversationReference, (context) => {
            // Echo text to user
            echo(context, messageText);
        });
    }, delayInMilliseconds);
}

function echo(context, messageText) {
    let count = context.state.conversation.count || 1;
    context.reply(`${count}: You said "${messageText}"`);
    context.state.conversation.count = count + 1;
}

// handle bot activities
function handleBotActivities(context) {
    if (context.request.type === 'message') {
        // Listen for user to say "delay <message>"
        const matched = /^delay (.*)/i.exec(context.request.text);
        if (matched) {
            // Delay echoed reply for 2 seconds
            delayEcho(context.conversationReference, matched[1], 2000);
            context.reply('Ok... Delaying reply for 2 seconds.');
        } else {
            // Echo immediately 
            echo(context, context.request.text);
        }
    } else {
        context.reply(`[${context.request.type} event detected]`);
    }
}

// bind activity handler to bot's onReceive method
bot.onReceive((context) => handleBotActivities(context));


// END OF LINE
