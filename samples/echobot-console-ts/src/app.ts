import { ConsoleAdapter, MemoryStorage, ConversationState } from 'botbuilder';

// Create adapter
const adapter = new ConsoleAdapter();

// Define conversation state shape
interface EchoState {
    count: number;
}

// Add conversation state middleware
const conversationState = new ConversationState<EchoState>(new MemoryStorage());
adapter.use(conversationState);

// Listen for incoming requests 
adapter.listen(async (context) => {
    if (context.request.type === 'message') {
        const state = conversationState.get(context);
        const count = state.count === undefined ? state.count = 0 : ++state.count;
        await context.sendActivity(`${count}: You said "${context.request.text}"`);
    } else {
        await context.sendActivity(`[${context.request.type} event detected]`);
    }
});
