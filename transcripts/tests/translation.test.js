const assert = require('assert');
const { LanguageTranslator, LocaleConverter } = require('botbuilder-ai');
const assertBotLogicWithTranscript = require('../../libraries/botbuilder-core/tests/transcriptUtilities').assertBotLogicWithBotBuilderTranscript;

var translatorKey = process.env['TRANSLATORKEY_TRANSCRIPT'];
xdescribe(`Translation Tests using transcripts`, function () {
    if (!translatorKey) {
        console.warn('* Missing Translator Environment variable (TRANSLATORKEY_TRANSCRIPT) - Skipping Translation Tests');
        return;
    }

    this.timeout(20000);

    it('TranslateToEnglish', assertBotLogicWithTranscript('TranslationTests/TranslateToEnglish.chat', TestLogic, TranslateToEnglishMiddleware));

    it('TranslateToUserLanguage', assertBotLogicWithTranscript('TranslationTests/TranslateToUserLanguage.chat', TestLogic, TranslateToUserLanguageMiddleware));

    it('LocaleConvertToEnglish', assertBotLogicWithTranscript('TranslationTests/LocaleConvertToEnglish.chat', TestLogic, LocaleConvertToEnglishMiddleware));
});

function TestLogic(conversationState, userState) {
    return async (context) => {
        if (!context.responded) {
            if (!context.activity.text.startsWith('set language ')) {
                await context.sendActivity(`message: ${context.activity.text}`);
            }
        }
    }
}

function TranslateToEnglishMiddleware(adapter, conversationState, userState) {
    var nativeLanguages = ['en-us'];
    var noTranslatePatterns = [];

    function getUserLanguage(context) {
        return userState.get(context).language || 'en-us';
    }

    async function setUserLanguage(context) {
        var userMessage = context.activity.text.toLowerCase();
        if (userMessage.startsWith('set language ')) {
            var state = userState.get(context);
            state.language = userMessage.substr(13, 5);
            await userState.write(context);
            return true;
        }

        return false;
    }

    adapter.use(new LanguageTranslator({
        translatorKey,
        nativeLanguages,
        noTranslatePatterns,
        getUserLanguage,
        setUserLanguage,
        translateBackToUserLanguage: false
    }))
}

function TranslateToUserLanguageMiddleware(adapter, conversationState, userState) {
    var nativeLanguages = ['en'];
    var noTranslatePatterns = [];

    function getUserLanguage(context) {
        return userState.get(context).language || 'en-us';
    }

    async function setUserLanguage(context) {
        var userMessage = context.activity.text.toLowerCase();
        if (userMessage.startsWith('set language ')) {
            var state = userState.get(context);
            state.language = userMessage.substr(13, 5);
            await userState.write(context);
            return true;
        }

        return false;
    }

    adapter.use(new LanguageTranslator({
        translatorKey,
        nativeLanguages,
        noTranslatePatterns,
        getUserLanguage,
        setUserLanguage,
        translateBackToUserLanguage: true
    }))
}

function LocaleConvertToEnglishMiddleware(adapter, conversationState, userState) {
    var botLocale = 'en-us';

    function getUserLanguage(context) {
        return userState.get(context).language || 'en-us';
    }

    async function setUserLanguage(context) {
        var userMessage = context.activity.text.toLowerCase();
        if (userMessage.startsWith('set language ')) {
            var state = userState.get(context);
            state.language = userMessage.substr(13, 5);
            await userState.write(context);
            return true;
        }

        return false;
    }

    adapter.use(new LocaleConverter({
        getUserLanguage,
        setUserLanguage,
        toLocale: botLocale
    }))
}