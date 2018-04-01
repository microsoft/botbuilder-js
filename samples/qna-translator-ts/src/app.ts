import { BotFrameworkAdapter, MemoryStorage, ConversationState, TurnContext } from 'botbuilder';
import { LanguageTranslator, LocaleConverter, QnAMaker } from 'botbuilder-ai';
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
interface LanguageState {
    language: string,
    locale: string
}

// Add conversation state middleware
const conversationState = new ConversationState<LanguageState>(new MemoryStorage());
adapter.use(conversationState);

// Delegates for getting and setting user language
function getUserLanguage(context: TurnContext): string {
    const state = conversationState.get(context)
    if (state.language == undefined) {
        return 'en';
    } else {
        return state.language;
    }
}

async function setUserLanguage(context: TurnContext): Promise<boolean> {
    let state = conversationState.get(context)
    if (context.activity.text.toLowerCase().startsWith('set my language to')) {
        state.language = context.activity.text.toLowerCase().replace('set my language to', '').trim();
        await context.sendActivity(`Setting your language to ${state.language}`);
        return Promise.resolve(true);
    } else {
        return Promise.resolve(false);
    }
}

// Delegates for getting and setting user locale
function getUserLocale(context: TurnContext): string {
    const state = conversationState.get(context)
    if (state.locale == undefined) {
        return 'en-us';
    } else {
        return state.locale;
    }
}

async function setUserLocale(context: TurnContext): Promise<boolean> {
    let state = conversationState.get(context)
    if (context.activity.text.toLowerCase().startsWith('set my locale to')) {        
        state.locale = context.activity.text.toLowerCase().replace('set my locale to', '').trim();
        await context.sendActivity(`Setting your locale to ${state.locale}`);
        return Promise.resolve(true);
    } else {
        return Promise.resolve(false);
    }
}

// Add language translator middleware
const languageTranslator = new LanguageTranslator({
    translatorKey: "xxxxxx",
    noTranslatePatterns: new Set<string>(),
    nativeLanguages: ['en'],
    setUserLanguage: setUserLanguage,
    getUserLanguage: getUserLanguage 
});
adapter.use(languageTranslator);

// Add locale converter middleware
const localeConverter = new LocaleConverter({
    toLocale: 'en-us',
    setUserLocale: setUserLocale,
    getUserLocale: getUserLocale
});
adapter.use(localeConverter);

// Add Qna Maker middleware
const qnaMaker = new QnAMaker({
    knowledgeBaseId: "xxxxxx",
    subscriptionKey: "xxxxxx"
});
adapter.use(qnaMaker);

// Listen for incoming requests 
server.post('/api/messages', (req, res) => {
    // Route received request to adapter for processing
    adapter.processActivity(req, res, async (context) => {
        if (context.activity.type != 'message') {
            await context.sendActivity(`[${context.activity.type} event detected]`);
        }
    });
});

