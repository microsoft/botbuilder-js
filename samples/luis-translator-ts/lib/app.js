"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
const botbuilder_ai_1 = require("botbuilder-ai");
const restify = require("restify");
// Create server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});
// Create adapter
const adapter = new botbuilder_1.BotFrameworkAdapter({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
// Add conversation state middleware
const conversationState = new botbuilder_1.ConversationState(new botbuilder_1.MemoryStorage());
adapter.use(conversationState);
// Delegates for getting and setting user language
function getUserLanguage(context) {
    const state = conversationState.get(context);
    if (state.language == undefined) {
        return 'en';
    }
    else {
        return state.language;
    }
}
function setUserLanguage(context) {
    return __awaiter(this, void 0, void 0, function* () {
        let state = conversationState.get(context);
        if (context.request.text.toLowerCase().startsWith('set my language to')) {
            state.language = context.request.text.toLowerCase().replace('set my language to', '').trim();
            yield context.sendActivity(`Setting your language to ${state.language}`);
            return Promise.resolve(true);
        }
        else {
            return Promise.resolve(false);
        }
    });
}
// Delegates for getting and setting user locale
function getUserLocale(context) {
    const state = conversationState.get(context);
    if (state.locale == undefined) {
        return 'en-us';
    }
    else {
        return state.locale;
    }
}
function setUserLocale(context) {
    return __awaiter(this, void 0, void 0, function* () {
        let state = conversationState.get(context);
        if (context.request.text.toLowerCase().startsWith('set my locale to')) {
            state.locale = context.request.text.toLowerCase().replace('set my locale to', '').trim();
            yield context.sendActivity(`Setting your locale to ${state.locale}`);
            return Promise.resolve(true);
        }
        else {
            return Promise.resolve(false);
        }
    });
}
// Add language translator middleware
const languageTranslator = new botbuilder_ai_1.LanguageTranslator({
    translatorKey: "xxxxxx",
    noTranslatePatterns: new Set(),
    nativeLanguages: ['en'],
    setUserLanguage: setUserLanguage,
    getUserLanguage: getUserLanguage
});
adapter.use(languageTranslator);
// Add locale converter middleware
const localeConverter = new botbuilder_ai_1.LocaleConverter({
    toLocale: 'en-us',
    setUserLocale: setUserLocale,
    getUserLocale: getUserLocale
});
adapter.use(localeConverter);
// Add Luis recognizer middleware
const luisRecognizer = new botbuilder_ai_1.LuisRecognizer({
    appId: "xxxxxx",
    subscriptionKey: "xxxxxx"
});
adapter.use(luisRecognizer);
// Listen for incoming requests 
server.post('/api/messages', (req, res) => {
    // Route received request to adapter for processing
    adapter.processRequest(req, res, (context) => __awaiter(this, void 0, void 0, function* () {
        if (context.request.type != 'message') {
            yield context.sendActivity(`[${context.request.type} event detected]`);
        }
        else {
            let results = luisRecognizer.get(context);
            for (const intent in results.intents) {
                yield context.sendActivity(`intent: ${intent.toString()} : ${results.intents[intent.toString()]}`);
            }
            for (const entity in results.entities) {
                yield context.sendActivity(`entity: ${entity.toString()} : ${results.entities[entity.toString()]}`);
            }
        }
    }));
});
