import { BotFrameworkAdapter, ConversationState, UserState, BotStateSet, MemoryStorage,TurnContext } from 'botbuilder';
import { DialogSet } from 'botbuilder-dialogs';
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

// Add state middleware
const storage = new MemoryStorage();
const convoState = new ConversationState(storage);
const userState = new UserState(storage);
adapter.use(new BotStateSet(convoState, userState));

// Create root bot
const bot = new AlarmBot(userState);

// Listen for incoming requests 
server.post('/api/messages', (req, res) => {
    // Route received request to adapter for processing
    adapter.processActivity(req, res, async (context) => {
        // Ensure user properly initialized
        const user = userState.get(context);
        if (!user.alarms) { user.alarms = [] }

        // Dispatch activity to bot
        const state = convoState.get(context);
        await bot.continue(context, state);
    });
});
