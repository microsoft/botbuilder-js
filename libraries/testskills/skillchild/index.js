
const restify = require('restify');

const { BotFrameworkAdapter } = require('botbuilder');
const { ChildBot } = require('./childBot');

const adapter = new BotFrameworkAdapter();

// Create HTTP server
const server = restify.createServer();
server.listen(3979, function() {
    console.log(`\n${ server.name } listening to ${ server.url }`);
    console.log(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
});

const bot = new ChildBot();

// Listen for incoming activities and route them to your bot main dialog.
server.post('/api/messages', (req, res) => {
    // Route received a request to adapter for processing
    adapter.processActivity(req, res, async (turnContext) => {
        // route to bot activity handler.
        await bot.run(turnContext);
    });
});
