const ai = require('botbuilder-ai');
var builder = require('botbuilder');
var services = require('botbuilder-services');
var restify = require('restify');

module.exports = {
    initBot: function (middlewareOptions) {
        // Create server
        let server = restify.createServer();
        server.listen(process.env.port || process.env.PORT || 3978, function () {
            console.log(`${server.name} listening to ${server.url}`);
        });
    
        // Create Bot Framework connector adapter
        const botFrameworkAdapter = new services.BotFrameworkAdapter({ 
            appId: process.env.MICROSOFT_APP_ID, 
            appPassword: process.env.MICROSOFT_APP_PASSWORD
        });
    
        server.post('/api/messages', botFrameworkAdapter.listen());
        // status route
        server.get('/', (req, res) => { res.send({status: "online"}); });
    
        // Initialize bot
        var bot = new builder.Bot(botFrameworkAdapter);
        if (middlewareOptions.consoleLogger) bot.use(new builder.ConsoleLogger());
        if (middlewareOptions.memoryStorage) bot.use(new builder.MemoryStorage());
        if (middlewareOptions.botStateManger) bot.use(new builder.BotStateManager());
    
        return bot;
    },
    initLuisRecognizer: function () {
        const luisAppId = process.env.LUIS_APP_ID;
        const subscriptionKey = process.env.LUIS_APP_KEY;
        return new ai.LuisRecognizer(luisAppId, luisAppKey);
    },
    handleConversationUpdateEvents: function (context) {
        if (context.request.channelId === "emulator") {
            // in the emulator, the IDs should be "default-user" and "default-bot"
            var id = context.request.membersAdded[0].id.split('-')[1];
            // uncomment next line to act on "bot added"
            //if (id === "bot") context.reply('Bot added to conversation.'); 
            if (id === "user") {
                context.reply('Welcome to SDK4 LUIS recognizer example');
            }
        } else {
            var added = context.request.membersAdded[0];
            context.reply(`Added to conversation - Name:${added.name}, ID: ${added.id}`)
        }
    },
    handleOtherActivityTypes: function (context) {
        // handle all other activity types
        context.reply(`[${context.request.type} event detected]`);
    }
}


// END OF LINE
