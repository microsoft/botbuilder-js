const assert = require('assert');
const ai = require('../');
const builder = require('botbuilder');
const process =require('process');
const translatorKey = process.env.TRANSLATORKEY;


describe('LanguageTranslator', function () {
    this.timeout(10000);
    
    if (!translatorKey) 
    {
        console.warn('WARNING: skipping LanguageTranslator test suite because TRANSLATORKEY environment variable is not defined');
        return;
    }

    it('should translate en to fr', function (done) {
        
        let toFrenchSettings = {
            translatorKey: translatorKey,
            nativeLanguages: ['fr', 'de'],
            noTranslatePatterns: new Set(),
        }

        const testAdapter = new builder.TestAdapter(c => c.sendActivity(c.request.text))
        .use(new ai.LanguageTranslator(toFrenchSettings))
        .test('greetings', 'salutations', 'should have received french')
        .then(() => done());
    });

    it('should not translate when a native language', function (done) {

        let toEnglishSettings = {
            translatorKey: translatorKey,
            nativeLanguages: ['fr', 'de', 'en'],
            noTranslatePatterns: new Set(),
            getUserLanguage: c => 'fr',
            setUserLanguage: c => Promise.resolve(false)
        }

        const testAdapter = new builder.TestAdapter(c => c.sendActivity(c.request.text))
        .use(new ai.LanguageTranslator(toEnglishSettings))
        .test('greetings', 'greetings', 'should have received english')
        .then(() => done());
    });

    it('no translate texts should not be translated', function (done) {

        let noTranslateSettings = {
            translatorKey: translatorKey,
            nativeLanguages: ['fr', 'de'],
            noTranslatePatterns: new Set(['(HI)', '(BYE)']),
            getUserLanguage: c => 'en',
            setUserLanguage: c => Promise.resolve(false)
        }

        const testAdapter = new builder.TestAdapter(c => c.sendActivity(c.request.text))
        .use(new ai.LanguageTranslator(noTranslateSettings))
        .test('HI hello BYE goodbye', 'HI Bonjour Bye adieu', 'should have received no translate patterns')
        .then(() => done())
    });

    it('should support changing language', function (done) {

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

        const testAdapter = new builder.TestAdapter(c => assert.equal(userLang, 'fr', 'should have changed language variable to fr'))
        .use(new ai.LanguageTranslator(changeLanguageSettings))
        .send('I would like to speak french')
        .then(() => done());
    });
})
