import { Bot, ConsoleLogger, MemoryStorage, BotStateManager, ConversationReference } from 'botbuilder';
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
const bot = new Bot(botFrameworkAdapter)
    .use(new ConsoleLogger())
    .use(new MemoryStorage())
    .use(new BotStateManager())
    .onReceive((context) => {
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
    });

function delayEcho(reference: ConversationReference, text: string, ms: number) {
    setTimeout(() => {
        // Create a context object for the reference
        bot.createContext(reference, (context) => {
            // Echo text to user
            echo(context, text);
        });
    }, ms);
}

function echo(context: BotContext, text: string) {
    let count = context.state.conversation.count || 1;
    context.reply(`${count}: You said "${text}"`);
    context.state.conversation.count = count + 1;
}

// END OF LINE
