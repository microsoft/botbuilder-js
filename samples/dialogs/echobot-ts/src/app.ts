import { BotFrameworkAdapter, MemoryStorage, ConversationState, BatchOutput, BotContext } from 'botbuilder';
import { DialogSet } from 'botbuilder-dialogs';
import * as restify from 'restify';

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

// Add conversation state middleware
interface EchoState {
    count: number;
}
const conversationState = new ConversationState<EchoState>(new MemoryStorage());
adapter.use(conversationState);

// Add batch output middleware
interface EchoContext extends BotContext {
    batch: BatchOutput;
}
adapter.use(new BatchOutput());

// Create empty dialog set
const dialogs = new DialogSet();

// Listen for incoming requests 
server.post('/api/messages', (req, res) => {
    // Route received request to adapter for processing
    adapter.processRequest(req, res, (context) => {
        if (context.request.type === 'message') {
            // Continue executing the "current" dialog, if any.
            return dialogs.continue(context).then(() => {
                // Check to see if anyone replied. If not then start echo dialog
                if (!context.responded) {
                    return dialogs.begin(context, 'echo');
                }
            });
        } else {
            return context.sendActivity(`[${context.request.type} event detected]`);
        }
    });
});

// Add dialogs
dialogs.add('echo', [
    function (context: EchoContext) {
        const state = conversationState.get(context);
        const count = state.count === undefined ? state.count = 0 : ++state.count;
        context.batch.reply(`${count}: You said "${context.request.text}"`);
        return dialogs.end(context);
    }
]);
