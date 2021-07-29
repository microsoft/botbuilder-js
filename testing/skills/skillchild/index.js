
const restify = require('restify');
const path = require('path');

const { BotFrameworkAdapter, ConversationState, MemoryStorage, UserState } = require('botbuilder');
const { ChildBot } = require('./childBot');
const { MainDialog } = require('./mainDialog');

const ENV_FILE = path.join(__dirname, '.env');
require('dotenv').config({ path: ENV_FILE});

const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
})

// Create HTTP server
const server = restify.createServer();
server.listen(3979, function() {
    console.log(`\n${ server.name } listening to ${ server.url }`);
    console.log(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
});

const memoryStorage = new MemoryStorage();
const conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);

const dialog = new MainDialog();
const bot = new ChildBot(conversationState, userState, dialog);

// Listen for incoming activities and route them to your bot main dialog.
server.post('/api/messages', (req, res) => {
    // Route received a request to adapter for processing
    adapter.processActivity(req, res, async (turnContext) => {
        // route to bot activity handler.
        await bot.run(turnContext);
    });
});
