import { Bot, ConsoleLogger, MemoryStorage, BotStateManager } from 'botbuilder';
import { BotFrameworkAdapter } from 'botbuilder-services';
import * as restify from "restify";

// Create server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});

// Create adapter and listen to our servers '/api/messages' route.
const botFrameworkAdapter = new BotFrameworkAdapter({ appId: process.env.MICROSOFT_APP_ID, appPassword: process.env.MICROSOFT_APP_PASSWORD });
server.post('/api/messages', <any>botFrameworkAdapter.listen());

// Initialize bot by passing it adapter
// - Add a logger to monitor bot.
// - Add storage so that we can track conversation & user state.
// - Add a receiver to process incoming activities.
const bot = new Bot(botFrameworkAdapter)
    .use(new ConsoleLogger())
    .use(new MemoryStorage())
    .use(new BotStateManager())
    .onReceive((context) => {
        if (context.request.type === 'message') {
            let count = context.state.conversation.count || 1;
            context.reply(`${count}: You said "${context.request.text}"`);
            context.state.conversation.count = count + 1;
        } else {
            context.reply(`[${context.request.type} event detected]`);
        }
    });

// END OF LINE
