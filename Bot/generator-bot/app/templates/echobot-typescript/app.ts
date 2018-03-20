import {BotFrameworkAdapter, ConversationState, MemoryStorage} from 'botbuilder';
import * as restify from 'restify';

// Create server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});

// Create adapter
const adapter = new BotFrameworkAdapter({
    appId: '<%= appId %>',
    get appPassword() {
        if (process.env.MICROSOFT_APP_PASSWORD) {
            return process.env.MICROSOFT_APP_PASSWORD;
        }
        throw new ReferenceError('Cannot find the Microsoft app password. Did you include it in your environment variables?');
    }
});

// Define conversation state shape
interface EchoState {
    count: number;
}

// Add conversation state middleware
const conversationState = new ConversationState<EchoState>(new MemoryStorage());
adapter.use(conversationState);

// Listen for incoming requests
server.post('/api/messages', (req, res) => {
    // Route received request to adapter for processing
    adapter.processRequest(req, res, async (context) => {
        if (context.request.type === 'message') {
            const state = conversationState.get(context);
            const count = state.count === undefined ? state.count = 0 : ++state.count;
            await context.sendActivity(`${count}: You said "${context.request.text}"`);
        } else {
            await context.sendActivity(`[${context.request.type} event detected]`);
        }
    });
});
