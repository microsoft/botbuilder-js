const assert = require('assert');
const ai = require('../');
const builder = require('botbuilder');
const process =require('process');
const translatorKey = process.env.TRANSLATORKEY;
const luisAppId = process.env.TRANSLATORLUISAPPID;
const luisAppKey = process.env.TRANSLATORLUISAPPKEY;

let setTestCaseLanguage = function (language) {
    return {
        receiveActivity(context, next) {
            context.state.conversation.language = language;
            return next();
        }
    };
}

describe('LanguageTranslator', function () {
    this.timeout(10000);
    
    if (!translatorKey) 
    {
        console.warn('WARNING: skipping LanguageTranslator test suite because TRANSLATORKEY environment variable is not defined');
        return;
    }
    if (!luisAppId) 
    {
        console.warn('WARNING: skipping LanguageTranslator test suite because TRANSLATORLUISAPPID environment variable is not defined');
        return;
    }
    if (!luisAppKey) 
    {
        console.warn('WARNING: skipping LanguageTranslator test suite because TRANSLATORLUISAPPKEY environment variable is not defined');
        return;
    }


    it('should translate en to fr and back again.', function (done) {
        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .use(new builder.MemoryStorage())
            .use(new builder.BotStateManager())
            .use(setTestCaseLanguage('en'))
            .use(new ai.LanguageTranslator(translatorKey, ["fr", 'de'], luisAppId, luisAppKey))
            .onReceive((context) => {
                assert.equal(context.request.text, 'salutations', 'should have received french');
                assert.notEqual(context.translation, null, 'should have translation context');
                assert.equal(context.translation.sourceText, "greetings", 'should have sourceText');
                assert.equal(context.translation.sourceLanguage, 'en', 'should have en sourceLanguage');
                assert.equal(context.translation.targetLanguage, 'fr', 'should have fr targetLanguage');
                context.reply('bonjour');
            });
        testAdapter.test('greetings', 'Hello', 'should have received english')
            .then(() => done());
    });

    it('should not translate when a native language.', function (done) {
        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .use(new builder.MemoryStorage())
            .use(new builder.BotStateManager())
            .use(setTestCaseLanguage('en'))
            .use(new ai.LanguageTranslator(translatorKey, ["fr", 'en', 'de'], luisAppId, luisAppKey))
            .onReceive((context) => {
                assert.equal(context.request.text, 'greetings', 'should have received english');
                assert.equal(context.translation.sourceText, null, 'should NOT have sourceText when no translation performed');
                assert.equal(context.translation.sourceLanguage, 'en', 'should have en sourceLanguage');
                assert.equal(context.translation.targetLanguage, 'en', 'should have en targetLanguage');
                context.reply('Hello');
            });
        testAdapter.test('greetings', 'Hello', 'should have received english')
            .then(() => done());
    });

    it('should not translate when no language', function (done) {
        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .use(new builder.MemoryStorage())
            .use(new builder.BotStateManager())
            .use(new ai.LanguageTranslator(translatorKey, ["fr", 'en', 'de'], luisAppId, luisAppKey))
            .onReceive((context) => {
                assert.equal(context.request.text, 'greetings', 'should have received english');
                assert.equal(context.translation.sourceText, null, 'should NOT have sourceText when no translation performed');
                assert.equal(context.translation.sourceLanguage, 'fr', 'should use nativeLanguages[0] as sourceLanguage');
                assert.equal(context.translation.targetLanguage, 'fr', 'should use nativeLanguages[0] as targetLanguage');
                context.reply('Hello');
            });
        testAdapter.test('greetings', 'Hello', 'should have received english')
            .then(() => done());
    });

    it('mention text should not be translated.', function (done) {
        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .use(new builder.MemoryStorage())
            .use(new builder.BotStateManager())
            .use(setTestCaseLanguage('en'))
            .use(new ai.LanguageTranslator(translatorKey, ["fr", 'de'], luisAppId, luisAppKey))
            .onReceive((context) => {
                assert(context.request.text.indexOf('HELLO') >= 0, 'should have left HELLO mention alone');
                assert(context.request.text.indexOf('Bonjour') >= 0, 'should have translated hello ');
                assert(context.request.text.indexOf('GOODBYE') >= 0, 'should have left GOODBYE mention alone');
                assert(context.request.text.indexOf('au revoir') >= 0, 'should have translated goodbye');
            });
        testAdapter.send({
            type: 'message',
            text: 'HELLO hello and GOODBYE goodbye',

            entities: [
                { type: "mention", text: 'HELLO' },
                { type: "mention", text: 'GOODBYE' },
            ]
        }).then(() => done());
    });

    it('should support changing language.', function (done) {
        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .use(new builder.MemoryStorage())
            .use(new builder.BotStateManager())
            .use(new ai.LanguageTranslator(translatorKey, ["en"], luisAppId, luisAppKey))
            .onReceive((context) => {
                if (context.request.text == "I would like to speak french")
                    context.reply('I will speak french');
                else if (context.request.text == "I would like to speak English")
                    context.reply('I will speak english');
                else
                    context.reply('Hello');
            });
        testAdapter
            .send('Hello').assertReply('Hello', 'should have received english')
            .send('I would like to speak french').assertReply('Je vais parler français', 'should have switched to french')
            .send('Je voudrais parler anglais').assertReply('I will speak english', 'should have switched back to english')
            .then(() => done());
    });

})
