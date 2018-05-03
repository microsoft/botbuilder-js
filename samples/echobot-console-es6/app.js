const { BotStateSet, ConsoleAdapter, ConversationState, MemoryStorage, UserState } = require('botbuilder');

// Create adapter
const adapter = new ConsoleAdapter();

// Add state middleware
const storage = new MemoryStorage();
const convoState = new ConversationState(storage);
const userState = new UserState(storage);
adapter.use(new BotStateSet(convoState, userState));

// Greet user
console.log(`Hi... I'm an echobot. Whatever you say I'll echo back.`);

adapter.listen(async (context) => {
    if (context.activity.type === 'message') {
        const state = convoState.get(context);
        const count = state.count === undefined ? state.count = 0 : ++state.count;
        await context.sendActivity(`${count}: You said "${context.activity.text}"`);
    } else {
        await context.sendActivity(`[${context.activity.type} event detected]`);
    }
});