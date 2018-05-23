import { BotFrameworkAdapter, MemoryStorage, ConversationState, TurnContext } from 'botbuilder';
import { DialogSet } from 'botbuilder-dialogs';
import * as restify from 'restify';

// Create server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});

// Create adapter
const adapter = new BotFrameworkAdapter( { 
    appId: '558e9c44-900b-42e2-a20a-1c5ebdcd97e6', // process.env.MICROSOFT_APP_ID, 
    appPassword: 'zlkq$7$dP%20!u{a' // process.env.MICROSOFT_APP_PASSWORD 
});

const connectionName = 'MyBuildConnection'; // process.env.CONNECTION_NAME;

// Add conversation state middleware
interface EchoState {
    dialogStack: any[];
    count: number;
}
const conversationState = new ConversationState<EchoState>(new MemoryStorage());
adapter.use(conversationState);

// Create empty dialog set
const dialogs = new DialogSet();

// Listen for incoming requests 
server.post('/api/messages', (req, res) => {
    // Route received request to adapter for processing
    adapter.processActivity(req, res, async (context) => {
        if (context.activity.type === 'message') {
            // Create dialog context and continue executing the "current" dialog, if any.
            const state = conversationState.get(context);
            const dc = dialogs.createContext(context, state);
            await dc.continue();

            // Check to see if anyone replied. If not then start echo dialog
            if (!context.responded) {
                await dc.begin('echo');
            }
        } else {
            await context.sendActivity(`[${context.activity.type} event detected]`);
        }
    });
});

// Add dialogs
dialogs.add('echo', [
    async function (dc) {
        const state = conversationState.get(dc.context);
        const count = state.count === undefined ? state.count = 0 : ++state.count;
        await dc.context.sendActivity(`${count}: You said "${dc.context.activity.text}"`);
        await dc.end();
    }
]);
