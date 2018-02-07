const botbuilder = require('botbuilder-core');
const FileStorage = require('botbuilder-node').FileStorage;
const BotFrameworkAdapter = require('botbuilder-services').BotFrameworkAdapter;
const rive = require('botbuilder-rivescript');
const restify = require('restify');
const path = require('path');

// init server
let server = restify.createServer();
server.getMessagePipelineToBot(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listing to ${server.url}`);
});

// init adapter
const botFrameworkAdapter = new BotFrameworkAdapter({ 
    appId: process.env.MICROSOFT_APP_ID, 
    appPassword: process.env.MICROSOFT_APP_PASSWORD 
});
// bind adapter to messages route
server.post('/api/messages', botFrameworkAdapter.listen());

// init bot
const bot = new botbuilder.Bot(botFrameworkAdapter)
    .use(new FileStorage())
    .use(new botbuilder.BotStateManager())
    .use(new rive.RiveScriptReceiver(path.join(__dirname, "./rive/complex.rive")));


// END OF LINE
