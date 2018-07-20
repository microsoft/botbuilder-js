import { BotFrameworkAdapter, BotStateSet, MemoryStorage } from 'botbuilder';
import * as restify from 'restify';
import { AlarmBot } from './alarmBot';

// Create server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});

// Create adapter
const adapter = new BotFrameworkAdapter( { 
    appId: process.env.MICROSOFT_APP_ID, 
    appPassword: process.env.MICROSOFT_APP_PASSWORD 
});

// Create bots dispatcher
const storage = new MemoryStorage();
const bot = new AlarmBot(storage);

// Add state middleware
adapter.use(new BotStateSet(bot.convoState, bot.userState));

// Listen for incoming requests 
server.post('/api/messages', (req, res) => {
    // Route received request to adapter for processing
    adapter.processActivity(req, res, async (context) => {
        // Dispatch activity to bot
        await bot.dispatch(context);
    });
});
