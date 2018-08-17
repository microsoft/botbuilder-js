const assert = require('assert');
const sinon = require('sinon');
const { TestAdapter, TurnContext } = require('botbuilder');
const { LanguageTranslator } = require('../');

const translatorKey = '';

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
    
    formatResponse = function(text, to, alignment) {
        return JSON.stringify([{
            translations: [{ 
                text: text,
                to: to,
                translations: { alignment:{ proj: alignment}}
            }]
        }]);
    }

    resolveCalls = function(langTranslator, language, mockedResponses) {
        let detectLangStub = sinon.stub(langTranslator.translator, 'detect');
        detectLangStub.resolves(language);

        let translateStub = sinon.stub(langTranslator.translator, 'translateArrayAsync');
        mockedResponses.forEach(function (current, index) {
            translateStub.onCall(index).resolves(current);
        });
    }

    it('should translate en to fr and support html tags in sentences', function (done) {
        
        let toFrenchSettings = {
            translatorKey: translatorKey,
            nativeLanguages: ['fr', 'de'],
        }

        let mockedResponses = [formatResponse(['salutations >'],['fr'])]
        let langTranslator = new LanguageTranslator(toFrenchSettings);
        resolveCalls(langTranslator, 'en', mockedResponses);

        const testAdapter = new TestAdapter(c => c.sendActivity(c.activity.text))
        .use(langTranslator)
        .test('greetings>', 'salutations >', 'should have received french')
        .then(() => done());
    });

    it('should handle punctuations', function (done) {
        
        let toFrenchSettings = {
            translatorKey: translatorKey,
            nativeLanguages: ['fr', 'de'],
        }

        let mockedResponses = [formatResponse(['0 : vous avez dit " Bonjour "'], ['fr'], ['0:0-0:0 1:1-1:1 3:5-3:6 3:5-8:11 7:10-13:15 12:12-16:16 13:17-17:23 18:18-24:24'])];
        let langTranslator = new LanguageTranslator(toFrenchSettings);
        resolveCalls(langTranslator, 'en', mockedResponses);

        const testAdapter = new TestAdapter(c => c.sendActivity(c.activity.text))
        .use(langTranslator)
        .test('0: You said "hello"', '0 : vous avez dit " Bonjour "', 'should have received french')
        .then(() => done());
    });

    it('should not translate when a native language', function (done) {

        let toEnglishSettings = {
            translatorKey: translatorKey,
            nativeLanguages: ['fr', 'de', 'en'],
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
            noTranslatePatterns: { 'fr': ['Bonjour (Jean mon ami)'] },
            getUserLanguage: c => 'fr',
            setUserLanguage: c => Promise.resolve(false)
        }

        let mockedResponses = [formatResponse(['Hello Jean mon ami 2018'],['en'],['0:6-0:4 8:11-6:9 13:15-11:12 17:19-14:19 21:24-21:24'])];
        let langTranslator = new LanguageTranslator(noTranslateSettings);
        resolveCalls(langTranslator, 'fr', mockedResponses);

        const testAdapter = new TestAdapter(c => c.sendActivity(c.activity.text))
        .use(langTranslator)
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
            noTranslatePatterns: { 'en': ['(HI)', '(BYE)'] }
        }

        let mockedResponses = [formatResponse([''],[''],[''])];
        let langTranslator = new LanguageTranslator(emptyMessageSettings);
        resolveCalls(langTranslator, '', mockedResponses);        

        const testAdapter = new TestAdapter(c => c.sendActivity(c.activity.text))
        .use(langTranslator)
        .test('\n\n', '', 'should have received an empty message')
        .then(() => done());
    });

    it('should handle wrong api keys', function (done) {
        
        let emptyMessageSettings = {
            translatorKey: 'N/A',
            nativeLanguages: ['fr', 'de'],
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
        }

        let mockedResponses = [formatResponse(['Salutations\nSalut'], ['fr', 'fr'])];
        let langTranslator = new LanguageTranslator(toFrenchSettings);
        resolveCalls(langTranslator, 'en', mockedResponses);

        const testAdapter = new TestAdapter(c => c.sendActivity(c.activity.text))
        .use(langTranslator)
        .test('Greetings\nHello', 'Salutations\nSalut', 'should have received french')
        .then(() => done());
    });
    
    it('should bypass calling service in middleware for non-message activities.', function (done) {
        let intercepted = true;
        let toEnglishSettings = {
            translatorKey: translatorKey,
            nativeLanguages: ['en', 'de'],
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
            noTranslatePatterns: { 'fr':['Jean mon ami'] },
            getUserLanguage: c => 'fr',
            setUserLanguage: c => Promise.resolve(false)
        }

        let mockedResponses = [formatResponse(['Hello Jean mon ami'], ['fr'], ['0:6-0:4 8:11-6:9 13:15-11:12 17:19-14:19'])];
        let langTranslator = new LanguageTranslator(noTranslateSettings);
        resolveCalls(langTranslator, '', mockedResponses);

        const testAdapter = new TestAdapter(c => c.sendActivity(c.activity.text))
        .use(langTranslator)
        .test('Bonjour Jean mon ami', 'Hello Jean mon ami', 'should have received no translate patterns')
        .then(() => done())
    });

    it('should handle special cases in no translates - 1', function (done) {

        let noTranslateSettings = {
            translatorKey: translatorKey,
            nativeLanguages: ['en'],
            noTranslatePatterns: { 'es': ['perr[oa]', 'Hi'] },
            getUserLanguage: c => 'es',
            setUserLanguage: c => Promise.resolve(false)
        }

        let mockedResponses = [formatResponse(['My perro\'s name is Enzo'], ['en'], ['0:1-0:1 3:7-3:5 9:10-6:7 9:10-14:15 12:16-9:12 18:21-17:20'])];
        let langTranslator = new LanguageTranslator(noTranslateSettings);
        resolveCalls(langTranslator, '', mockedResponses);

        const testAdapter = new TestAdapter(c => c.sendActivity(c.activity.text))
        .use(langTranslator)
        .test('mi perro se llama Enzo', 'My perro\'s name is Enzo', 'should have received no translate patterns')
        .then(() => done())
    });

    it('should handle special cases in no translates - 2', function (done) {

        let noTranslateSettings = {
            translatorKey: translatorKey,
            nativeLanguages: ['en'],
            noTranslatePatterns: { 'fr': ['mon nom est (.+)'] },
            getUserLanguage: c => 'fr',
            setUserLanguage: c => Promise.resolve(false)
        }

        let mockedResponses = [formatResponse(['My name is l\'etat'], ['en'], ['0:2-0:1 4:6-3:6 8:10-8:9 12:13-11:13 14:17-15:19'])];
        let langTranslator = new LanguageTranslator(noTranslateSettings);
        resolveCalls(langTranslator, '', mockedResponses);

        const testAdapter = new TestAdapter(c => c.sendActivity(c.activity.text))
        .use(langTranslator)
        .test('mon nom est l\'etat', 'My name is l\'etat', 'should have received no translate patterns')
        .then(() => done())
    });

    it('should translate back to user language', function (done) {
        
        let translateBackSettings = {
            translatorKey: translatorKey,
            nativeLanguages: ['en'],
            getUserLanguage: () => 'fr',
            translateBackToUserLanguage: true
        }

        let mockedResponses = [
            formatResponse(['bonjour'], ['en']), 
            formatResponse(['Salut'], ['fr'])
        ]
        let langTranslator = new LanguageTranslator(translateBackSettings);
        resolveCalls(langTranslator, '', mockedResponses);

        const testAdapter = new TestAdapter(c => c.sendActivity(c.activity.text))
        .use(langTranslator)
        .test('bonjour', 'Salut', 'should have received french')
        .then(() => done());
    });

    it('should not translate back to user language for non-message activites', function (done) {
        
        let translateBackSettings = {
            translatorKey: translatorKey,
            nativeLanguages: ['en'],
            getUserLanguage: () => 'fr',
            translateBackToUserLanguage: true
        }

        let mockedResponses = [formatResponse(['Foo'], ['en'])];
        let langTranslator = new LanguageTranslator(translateBackSettings);
        resolveCalls(langTranslator, '', mockedResponses);

        const context = new TestContext({ text: 'hello', type: 'foo' });
        const testAdapter = new TestAdapter(c => c.sendActivity(context.activity))
        .use(langTranslator)
        .test('foo', context.activity, 'should have received hello with no translation')
        .then(() => done());
    });

    it('should handle long sentences', function (done) {
        
        let toFrenchSettings = {
            translatorKey: translatorKey,
            nativeLanguages: ['fr', 'de'],
            wordDictionary: { 'first': 'enregistreuse' }
        }

        let message = 'Prior to your first visit, preferably starting in the morning '
        + 'to fully benefit from your day, remember to write your name, first name and '
        + 'the current date (without overwriting and crossing out) on the back of your '
        + 'pass in order to activate it consecutively for 2, 4, or 6 days. '
        + 'Presenting your pass at the entrance of monuments and museums grants you '
        + 'FREE access with no waiting time at the cash register.';
        
        let translatedMessage = 'Avant votre première visite, '
        + 'de préférence à partir du matin pour profiter pleinement de votre journée, '
        + 'n\'oubliez pas d\'écrire votre nom, prénom et la date actuelle '
        + '(sans écraser et de passage) sur le dos de votre laissez-passer '
        + 'afin de l\'activer consécutivement pour 2 , 4 ou 6 jours. '
        + 'La présentation de votre laissez-passer à l\'entrée des monuments et des musées '
        + 'vous accorde un accès gratuit sans temps d\'attente à la caisse enregistreuse';

        let mockedResponses = [formatResponse([translatedMessage], ['fr'], ['262:262-270:270 264:264-272:272 267:268-274:275 270:270-277:277 272:275-279:283 276:276-284:284'])];
        let langTranslator = new LanguageTranslator(toFrenchSettings);
        resolveCalls(langTranslator, 'en', mockedResponses);

        const testAdapter = new TestAdapter(c => c.sendActivity(c.activity.text))
        .use(langTranslator)
        .test(message, translatedMessage, 'should have received french')
        .then(() => done());
    });

    it('should use dictionary', function (done) {

        let dictionarySettings = {
            translatorKey: translatorKey,
            nativeLanguages: ['fr', 'de'],
            wordDictionary: { 'Mahmoud': 'John', 'Mohamed': 'Harvey' },
            getUserLanguage: c => 'en',
            setUserLanguage: c => Promise.resolve(false)
        }

        let mockedResponses = [formatResponse(['Je suis John'], ['fr'], ['0:0-0:1 2:3-3:6 5:11-8:14'])];
        let langTranslator = new LanguageTranslator(dictionarySettings);
        resolveCalls(langTranslator, '', mockedResponses);

        const testAdapter = new TestAdapter(c => c.sendActivity(c.activity.text))
        .use(langTranslator)
        .test('I am Mahmoud', 'Je suis John', 'should have translated word')
        .then(() => done())
    });
})
