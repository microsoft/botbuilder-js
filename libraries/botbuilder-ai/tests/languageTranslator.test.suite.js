const assert = require('assert');
const ai = require('../');
const builder = require('botbuilder');
const process =require('process');
const translatorKey = process.env.TRANSLATORKEY;

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

    it('should translate en to fr.', function (done) {
        
        let toFrenchSettings = {
            translatorKey: translatorKey,
            nativeLanguages: ['fr', 'de'],
            noTranslatePatterns: new Set(),
        }

        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .use(new builder.MemoryStorage())
            .use(new builder.BotStateManager())
            .use(setTestCaseLanguage('en'))
            .use(new ai.LanguageTranslator(toFrenchSettings))
            .onReceive((context) => {
                context.reply(context.request.text)
            });
        testAdapter.test('greetings', 'salutations', 'should have received french')
            .then(() => done());
    });

    it('should not translate when a native language.', function (done) {

        let toEnglishSettings = {
            translatorKey: translatorKey,
            nativeLanguages: ['fr', 'de', 'en'],
            noTranslatePatterns: new Set(),
            getUserLanguage: c => 'fr',
            setUserLanguage: c => Promise.resolve(false)
        }

        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .use(new builder.MemoryStorage())
            .use(new builder.BotStateManager())
            .use(setTestCaseLanguage('en'))
            .use(new ai.LanguageTranslator(toEnglishSettings))
            .onReceive((context) => {
                context.reply(context.request.text)
            });
        testAdapter.test('greetings', 'greetings', 'should have received english')
            .then(() => done());
    });

    it('no translate texts should not be translated.', function (done) {

        let noTranslateSettings = {
            translatorKey: translatorKey,
            nativeLanguages: ['fr', 'de'],
            noTranslatePatterns: new Set(['(HI)', '(BYE)']),
            getUserLanguage: c => 'en',
            setUserLanguage: c => Promise.resolve(false)
        }

        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .use(new builder.MemoryStorage())
            .use(new builder.BotStateManager())
            .use(new ai.LanguageTranslator(noTranslateSettings))
            .onReceive((context) => {
                context.reply(context.request.text);
            });
        testAdapter.send('HI hello Bye goodbye').assertReply('HI Bonjour Bye adieu')
        .then(() => done());
    });

    it('should support changing language.', function (done) {

        let userLang = 'en';

        let changeLanguageSettings = {
            translatorKey: translatorKey,
            nativeLanguages: ['en'],
            getUserLanguage: c => userLang,
            setUserLanguage: c => {
                if (c.request.text == 'I would like to speak french') {
                    userLang = 'fr';
                    return Promise.resolve(true);
                }
                return Promise.resolve(false);
            }
        }


        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .use(new builder.MemoryStorage())
            .use(new builder.BotStateManager())
            .use(new ai.LanguageTranslator(changeLanguageSettings))
            .onReceive((context) => {
                if (context.request.text == "I would like to speak french") {
                    assert.equal('fr', userLang, 'should have changed language variable to french');
                    context.reply('Je vais parler français');
                }
            });
        testAdapter
            .send('I would like to speak french').assertReply('Je vais parler français', 'should have switched to french')
            .then(() => done());
    });
})
