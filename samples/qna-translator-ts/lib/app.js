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
const supportedLanguages = ['en', 'fr', 'de', 'tr'];
const supportedLocales = ['en-us', 'fr-fr', 'zn-ch'];
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
        if (context.activity.text.toLowerCase().startsWith('set my language to')) {
            let newLanguage = context.activity.text.toLowerCase().replace('set my language to', '').trim();
            if (supportedLanguages.indexOf(newLanguage) != -1) {
                state.language = newLanguage;
                yield context.sendActivity(`Setting your language to ${state.language}`);
            }
            else {
                yield context.sendActivity('Language not supported');
            }
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
        if (context.activity.text.toLowerCase().startsWith('set my locale to')) {
            let newLocale = context.activity.text.toLowerCase().replace('set my locale to', '').trim();
            if (supportedLocales.indexOf(newLocale) != -1) {
                state.locale = newLocale;
                yield context.sendActivity(`Setting your locale to ${state.locale}`);
            }
            else {
                yield context.sendActivity('Locale not supported');
            }
            return Promise.resolve(true);
        }
        else {
            return Promise.resolve(false);
        }
    });
}
// Add locale converter middleware
const localeConverter = new botbuilder_ai_1.LocaleConverter({
    toLocale: 'en-us',
    setUserLocale: setUserLocale,
    getUserLocale: getUserLocale
});
adapter.use(localeConverter);
// Add language translator middleware
const languageTranslator = new botbuilder_ai_1.LanguageTranslator({
    translatorKey: "xxxxxx",
    nativeLanguages: ['en'],
    setUserLanguage: setUserLanguage,
    getUserLanguage: getUserLanguage,
    translateBackToUserLanguage: true
});
adapter.use(languageTranslator);
// Add Qna Maker middleware
const qnaMaker = new botbuilder_ai_1.QnAMaker({
    knowledgeBaseId: "xxxxxx",
    endpointKey: "xxxxxx",
    host: "xxxxxx"
}, {
    answerBeforeNext: true
});
adapter.use(qnaMaker);
// Listen for incoming requests 
server.post('/api/messages', (req, res) => {
    // Route received request to adapter for processing
    adapter.processActivity(req, res, (context) => __awaiter(this, void 0, void 0, function* () {
        if (context.activity.type != 'message') {
            yield context.sendActivity(`[${context.activity.type} event detected]`);
        }
    }));
});
