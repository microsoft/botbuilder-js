const { ConsoleAdapter, ConversationState, MemoryStorage } = require('botbuilder');

// Create adapter
const adapter = new ConsoleAdapter();

// Add conversation state middleware
const conversationState = new ConversationState(new MemoryStorage());
adapter.use(conversationState);

// Greet user
console.log(`Hi... I'm an echobot. Whatever you say I'll echo back.`);

adapter.listen(async (context) => {
    if (context.activity.type === 'message') {
        const state = conversationState.get(context);
        const count = state.count === undefined ? state.count = 0 : ++state.count;
        await context.sendActivity(`${count}: You said "${context.activity.text}"`);
    } else {
        await context.sendActivity(`[${context.activity.type} event detected]`);
    }
});