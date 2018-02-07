const builder = require('botbuilder');
const services = require('botbuilder-services');
const restify = require('restify');
const config = require('./bot/config');
const router = require('./bot/router');


// create server
let server = restify.createServer();
server.getMessagePipelineToBot(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});

// create Bot Framework connector adapter
const botFrameworkAdapter = new services.BotFrameworkAdapter({ 
    appId: process.env.MICROSOFT_APP_ID, 
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// bind adapter to messages route
server.post('/api/messages', botFrameworkAdapter.listen());
// status route
server.get('/', (req, res) => { res.send({status: "online"}); });

// init bot
var bot = new builder.Bot(botFrameworkAdapter);
// add middleware
if (config.middleware.consoleLogger) bot.use(new builder.ConsoleLogger());
if (config.middleware.memoryStorage) bot.use(new builder.MemoryStorage());
if (config.middleware.botStateManager) bot.use(new builder.BotStateManager());
// add router
bot.onReceive((context) => router.route(context));


// END OF LINE
