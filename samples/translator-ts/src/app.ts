import { BotFrameworkAdapter, MemoryStorage, ConversationState } from 'botbuilder';
import { LanguageTranslator, LocaleConverter } from 'botbuilder-ai';
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

// Define conversation state shape
interface EchoState {
    count: number;
}

// Add conversation state middleware
const conversationState = new ConversationState<EchoState>(new MemoryStorage());
adapter.use(conversationState);

// Add language translator middleware
const languageTranslator = new LanguageTranslator({
    translatorKey: "xxxxxx",
    noTranslatePatterns: new Set<string>(),
    nativeLanguages: ['fr', 'de'] 
});
adapter.use(languageTranslator);

// Add locale converter middleware
const localeConverter = new LocaleConverter({
    toLocale: 'fr-fr',
    fromLocale: 'en-us'
})
adapter.use(localeConverter);

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
