const assert = require('assert');
const { TestAdapter, TurnContext } = require('botbuilder');
const { LanguageTranslator } = require('../');

const translatorKey = process.env.TRANSLATORKEY;

class TestContext extends TurnContext {
    constructor(request) {
        super(new TestAdapter(), request);
        this.sent = undefined;
        this.onSendActivities((context, activities, next) => {
            this.sent = activities;
        });
    }
}

describe('LanguageTranslator', function () {
    this.timeout(10000);
    
    if (!translatorKey) 
    {
        console.warn('WARNING: skipping LanguageTranslator test suite because TRANSLATORKEY environment letiable is not defined');
        return;
    }

    it('should translate en to fr and support html tags in sentences', function (done) {
        
        let toFrenchSettings = {
            translatorKey: translatorKey,
            nativeLanguages: ['fr', 'de'],
            noTranslatePatterns: new Set()
        }

        const testAdapter = new TestAdapter(c => c.sendActivity(c.activity.text))
        .use(new LanguageTranslator(toFrenchSettings))
        .test('greetings>', 'salutations >', 'should have received french')
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

        const testAdapter = new TestAdapter(c => c.sendActivity(c.activity.text))
        .use(new LanguageTranslator(toEnglishSettings))
        .test('greetings', 'greetings', 'should have received english')
        .then(() => done());
    });

    it('should not translate no translate texts and numbers', function (done) {

        let noTranslateSettings = {
            translatorKey: translatorKey,
            nativeLanguages: ['en', 'de'],
            noTranslatePatterns: new Set(['Bonjour (Jean mon ami)']),
            getUserLanguage: c => 'fr',
            setUserLanguage: c => Promise.resolve(false)
        }

        const testAdapter = new TestAdapter(c => c.sendActivity(c.activity.text))
        .use(new LanguageTranslator(noTranslateSettings))
        .test('Bonjour Jean mon ami 2018', 'Hello Jean mon ami 2018', 'should have received no translate patterns')
        .then(() => done())
    });

    it('should support changing language', function (done) {

        let userLang = 'en';

        let changeLanguageSettings = {
            translatorKey: translatorKey,
            nativeLanguages: ['en'],
            getUserLanguage: c => userLang,
            setUserLanguage: c => {
                if (c.activity.text == 'I would like to speak french') {
                    userLang = 'fr';
                    return Promise.resolve(true);
                }
                return Promise.resolve(false);
            }
        }

        const testAdapter = new TestAdapter(c => assert.equal(userLang, 'fr', 'should have changed language letiable to fr'))
        .use(new LanguageTranslator(changeLanguageSettings))
        .send('I would like to speak french')
        .then(() => done());
    });

    it('should handle empty messages', function (done) {
        
        let emptyMessageSettings = {
            translatorKey: translatorKey,
            nativeLanguages: ['fr', 'de'],
            noTranslatePatterns: new Set(['(HI)', '(BYE)'])
        }

        const testAdapter = new TestAdapter(c => c.sendActivity(c.activity.text))
        .use(new LanguageTranslator(emptyMessageSettings))
        .test('\n\n', '', 'should have received an empty message')
        .then(() => done());
    });

    it('should handle wrong api keys', function (done) {
        
        let emptyMessageSettings = {
            translatorKey: 'N/A',
            nativeLanguages: ['fr', 'de'],
            noTranslatePatterns: new Set()
        }

        const testAdapter = new TestAdapter(c => c.sendActivity(c.activity.text))
        .use(new LanguageTranslator(emptyMessageSettings))
        .send('Hello')
        .catch(error => done());
    });

    it('should translate multiple sentences', function (done) {
        
        let toFrenchSettings = {
            translatorKey: translatorKey,
            nativeLanguages: ['fr', 'de'],
            noTranslatePatterns: new Set()
        }

        const testAdapter = new TestAdapter(c => c.sendActivity(c.activity.text))
        .use(new LanguageTranslator(toFrenchSettings))
        .test('Greetings\nHello', 'Salutations\nSalut', 'should have received french')
        .then(() => done());
    });
    
    it('should bypass calling service in middleware for non-message activities.', function (done) {
        let intercepted = true;
        let toEnglishSettings = {
            translatorKey: translatorKey,
            nativeLanguages: ['en', 'de'],
            noTranslatePatterns: new Set()
        }

        const context = new TestContext({ text: 'bonjour', type: 'foo' });
        const translator = new LanguageTranslator(toEnglishSettings)
        .onTurn(context, () => {
            intercepted = false;
            Promise.resolve();
        })
        .then(() => {
            assert(!intercepted, 'intercepted');
            done();
        });
    });

    it('should handle no translate texts with no groups', function (done) {

        let noTranslateSettings = {
            translatorKey: translatorKey,
            nativeLanguages: ['en', 'de'],
            noTranslatePatterns: new Set(['Jean mon ami']),
            getUserLanguage: c => 'fr',
            setUserLanguage: c => Promise.resolve(false)
        }

        const testAdapter = new TestAdapter(c => c.sendActivity(c.activity.text))
        .use(new LanguageTranslator(noTranslateSettings))
        .test('Bonjour Jean mon ami', 'Hello Jean mon ami', 'should have received no translate patterns')
        .then(() => done())
    });

    it('should handle special cases in no translates - 1', function (done) {

        let noTranslateSettings = {
            translatorKey: translatorKey,
            nativeLanguages: ['en'],
            noTranslatePatterns: new Set(['perr[oa]']),
            getUserLanguage: c => 'es',
            setUserLanguage: c => Promise.resolve(false)
        }

        const testAdapter = new TestAdapter(c => c.sendActivity(c.activity.text))
        .use(new LanguageTranslator(noTranslateSettings))
        .test('mi perro se llama Enzo', "My perro's name is Enzo", 'should have received no translate patterns')
        .then(() => done())
    });

    it('should handle special cases in no translates - 2', function (done) {

        let noTranslateSettings = {
            translatorKey: translatorKey,
            nativeLanguages: ['en'],
            noTranslatePatterns: new Set(['mon nom est (.+)']),
            getUserLanguage: c => 'fr',
            setUserLanguage: c => Promise.resolve(false)
        }

        const testAdapter = new TestAdapter(c => c.sendActivity(c.activity.text))
        .use(new LanguageTranslator(noTranslateSettings))
        .test("mon nom est l'etat", "My name is l'etat", 'should have received no translate patterns')
        .then(() => done())
    });

    it('should translate back to user language', function (done) {
        
        let translateBackSettings = {
            translatorKey: translatorKey,
            nativeLanguages: ['en'],
            noTranslatePatterns: new Set(),
            getUserLanguage: () => 'fr',
            translateBackToUserLanguage: true
        }

        const testAdapter = new TestAdapter(c => c.sendActivity(c.activity.text))
        .use(new LanguageTranslator(translateBackSettings))
        .test('bonjour', 'Salut', 'should have received french')
        .then(() => done());
    });

    it('should not translate back to user language for non-message activites', function (done) {
        
        let translateBackSettings = {
            translatorKey: translatorKey,
            nativeLanguages: ['en'],
            noTranslatePatterns: new Set(),
            getUserLanguage: () => 'fr',
            translateBackToUserLanguage: true
        }

        const context = new TestContext({ text: 'hello', type: 'foo' });
        const testAdapter = new TestAdapter(c => c.sendActivity(context.activity))
        .use(new LanguageTranslator(translateBackSettings))
        .test('foo', context.activity, 'should have received hello with no translation')
        .then(() => done());
    });
})
