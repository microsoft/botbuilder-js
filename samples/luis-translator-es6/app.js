const { BotFrameworkAdapter, MemoryStorage, ConversationState } = require('botbuilder');
const restify = require('restify');

const supportedLanguages = ['en', 'fr', 'de', 'tr'];
const supportedLocales = ['en-us', 'fr-fr', 'zn-ch'];

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
    let state = conversationState.get(context);
    if (context.activity.text.toLowerCase().startsWith('set my language to')) {
        let newLanguage = context.activity.text.toLowerCase().replace('set my language to', '').trim();
        if (supportedLanguages.indexOf(newLanguage) != -1) {
            state.language = newLanguage;
            await context.sendActivity(`Setting your language to ${state.language}`);
        } else {
            await context.sendActivity('Language not supported');
        }
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
    if (context.activity.text.toLowerCase().startsWith('set my locale to')) {
        let newLocale = context.activity.text.toLowerCase().replace('set my locale to', '').trim();
        if (supportedLocales.indexOf(newLocale) != -1) {
            state.locale = newLocale;
            await context.sendActivity(`Setting your locale to ${state.locale}`);
        } else {
            await context.sendActivity('Locale not supported');
        }
        return Promise.resolve(true);
    } else {
        return Promise.resolve(false);
    }
}

// Add locale converter middleware
const localeConverter = new LocaleConverter({
    toLocale: 'en-us',
    setUserLocale: setUserLocale,
    getUserLocale: getUserLocale
});
adapter.use(localeConverter);

// Add language translator middleware
const languageTranslator = new LanguageTranslator({
    translatorKey: "xxxxxx",
    nativeLanguages: ['en'],
    setUserLanguage: setUserLanguage,
    getUserLanguage: getUserLanguage 
});
adapter.use(languageTranslator);

// Add Luis recognizer middleware
const luisRecognizer = new LuisRecognizer({
    appId: "xxxxxx",
    subscriptionKey: "xxxxxx"
});
adapter.use(luisRecognizer);

// Listen for incoming requests 
server.post('/api/messages', (req, res) => {
    // Route received request to adapter for processing
    adapter.processActivity(req, res, (context) => {
        if (context.activity.type != 'message') {
            await context.sendActivity(`[${context.activity.type} event detected]`);
        } else {
            let results = luisRecognizer.get(context);
            for (const intent in results.intents) {
                await context.sendActivity(`intent: ${intent.toString()} : ${results.intents[intent.toString()]}`)
            }
            
            for (const entity in results.entities) {
                await context.sendActivity(`entity: ${entity.toString()} : ${results.entities[entity.toString()]}`)
            }
        }
    });
});
