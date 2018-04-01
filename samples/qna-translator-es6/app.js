const { BotFrameworkAdapter, MemoryStorage, ConversationState } = require('botbuilder');
const { LanguageTranslator, LocaleConverter, QnAMaker } = require('botbuilder-ai')
const restify = require('restify');

// Create server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});

// Create adapter
const adapter = new BotFrameworkAdapter({ 
    appId: process.env.MICROSOFT_APP_ID, 
    appPassword: process.env.MICROSOFT_APP_PASSWORD 
});

// Add conversation state middleware
const conversationState = new ConversationState(new MemoryStorage());
adapter.use(conversationState);

// Delegates for getting and setting user language
function getUserLanguage(context) {
    const state = conversationState.get(context)
    if (state.language == undefined) {
        return 'en';
    } else {
        return state.language;
    }
}

async function setUserLanguage(context) {
    let state = conversationState.get(context)
    if (context.request.text.toLowerCase().startsWith('set my language to')) {
        state.language = context.request.text.toLowerCase().replace('set my language to', '').trim();
        await context.sendActivity(`Setting your language to ${state.language}`);
        return Promise.resolve(true);
    } else {
        return Promise.resolve(false);
    }
}

// Delegates for getting and setting user locale
function getUserLocale(context) {
    const state = conversationState.get(context)
    if (state.locale == undefined) {
        return 'en-us';
    } else {
        return state.locale;
    }
}

async function setUserLocale(context) {
    let state = conversationState.get(context)
    if (context.request.text.toLowerCase().startsWith('set my locale to')) {        
        state.locale = context.request.text.toLowerCase().replace('set my locale to', '').trim();
        await context.sendActivity(`Setting your locale to ${state.locale}`);
        return Promise.resolve(true);
    } else {
        return Promise.resolve(false);
    }
}

// Add language translator middleware
const languageTranslator = new LanguageTranslator({
    translatorKey: "xxxxxx ",
    noTranslatePatterns: new Set(),
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
    subscriptionKey: "xxxxxx",
    answerBeforeNext: true
});
adapter.use(qnaMaker);

// Listen for incoming requests 
server.post('/api/messages', (req, res) => {
    // Route received request to adapter for processing
    adapter.processRequest(req, res, (context) => {
        if (context.request.type != 'message') {
            return context.sendActivity(`[${context.request.type} event detected]`);
        }
    });
});
