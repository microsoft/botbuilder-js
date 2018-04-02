const assert = require('assert');
const { TurnContext, TestAdapter } = require('botbuilder');
const { LocaleConverter } = require('../');

class TestContext extends TurnContext {
    constructor(request) {
        super(new TestAdapter(), request);
        this.sent = undefined;
        this.onSendActivities((context, activities, next) => {
            this.sent = activities;
        });
    }
}

describe('LocaleConverter', function () {
    this.timeout(10000);

    it('should convert locale to fr', function (done) {
        
        let toFrenchSettings = {
            toLocale: 'fr-fr',
            fromLocale: 'en-us'
        };

        const testAdapter = new TestAdapter(c => c.sendActivity(c.activity.text))
        .use(new LocaleConverter(toFrenchSettings))
        .test('10/21/2018', '21/10/2018', 'should have received date in usa french locale')
        .then(() => done());
    });

    it('should convert locale to chinese using delegate', function (done) {

        let toChineseSettings = {
            toLocale: 'zh-cn',
            getUserLocale: c => 'en-us',
            setUserLocale: c => Promise.resolve(false)
        }

        const testAdapter = new TestAdapter(c => c.sendActivity(c.activity.text))
        .use(new LocaleConverter(toChineseSettings))
        .test('10/21/2018', '2018-10-21', 'should have received date in chinese locale')
        .then(() => done());
    });

    it('should support changing locale', function (done) {
        
        let userLocale = 'en-us';

        let changeLocaleSettings = {
            toLocale: 'zh-cn',
            getUserLocale: c => userLocale,
            setUserLocale: c => {
                if (c.activity.text == 'Change my locale to fr-fr') {
                    userLocale = 'fr-fr';
                    return Promise.resolve(true);
                }
                return Promise.resolve(false);
            }
        }

        const testAdapter = new TestAdapter(c => assert.equal(userLocale, 'fr-fr', 'should have changed locale letiable to fr-fr'))
        .use(new LocaleConverter(changeLocaleSettings))
        .send('Change my locale to fr-fr')
        .then(() => done());
    });

    it('should use en-us as default from locale', function (done) {
        
        let noFromLocaleSettings = {
            toLocale: 'zh-cn',
        }

        const testAdapter = new TestAdapter(c => c.sendActivity(c.activity.text))
        .use(new LocaleConverter(noFromLocaleSettings))
        .test('10/21/2018', '2018-10-21', 'should have received date in chinese locale')
        .then(() => done());
    });
    
    it('should convert from different locales', function(done) {
        
        let noFromLocaleSettings = {
            toLocale: 'en-us',
        }

        fromLocales = ['fr', 'pt', 'zh', 'es', 'en'];
        fromDates = ['21/10/2018', '21/10/2018', '2018-10-21', '21/10/2018', '10/21/2018'];

        let testAdapter;

        for (let index = 0; index < fromLocales.length; index++) {
            noFromLocaleSettings.fromLocale = fromLocales[index]
            testAdapter = new TestAdapter(c => c.sendActivity(c.activity.text))
            .use(new LocaleConverter(noFromLocaleSettings))
            .test(fromDates[index], '10/21/2018', `should have received date in ${fromLocales[index]} locale`)
        }
        testAdapter
        .then(() => done());
    });

    it('should get all supported locales', function(done) {
        
        let localeConverter = new LocaleConverter({ toLocale: 'en-us' });
        localeConverter.getAvailableLocales()
        .then(result => {
            assert.equal(result.length, 22, 'should support 22 locales');
            return done();
        })
    });

    it('should throw unsupported from locale error when an invalid locale is provided', function (done) {
        
        let invalidFromLocaleSettings = {
            fromLocale: '',
            toLocale: 'zh-cn',
        }

        const testAdapter = new TestAdapter(c => c.sendActivity(c.activity.text))
        .use(new LocaleConverter(invalidFromLocaleSettings))
        .send('10/21/2018')
        .catch(error => {
            assert.equal(error, 'Error: Unsupported from locale', 'should throw an error');
            return done();
        })
    });

    it('should support converting time only', function (done) {
        
        let timeSettings = {
            fromLocale: 'en-us',
            toLocale: 'fr-fr',
        }

        const testAdapter = new TestAdapter(c => c.sendActivity(c.activity.text))
        .use(new LocaleConverter(timeSettings))
        .test('half past 9 am', '09:30', 'should have converted the time')
        .then(() => done());
    });

    it('should support converting ranges', function (done) {
        
        let rangeSettings = {
            fromLocale: 'en-us',
            toLocale: 'fr-fr',
        }

        const testAdapter = new TestAdapter(c => c.sendActivity(c.activity.text))
        .use(new LocaleConverter(rangeSettings))
        .test('from 10/21/2018 to 10/23/2018', '21/10/2018', 'should have converted the range')
        .then(() => done());
    });

    it('should throw an error if an unsupported to locale is used', function (done) {
        
        let rangeSettings = {
            fromLocale: 'en-us',
            toLocale: 'N/A',
        }

        const testAdapter = new TestAdapter(c => c.sendActivity(c.activity.text))
        .use(new LocaleConverter(rangeSettings))
        .send('10/21/2018')
        .catch(error => {
            assert.equal(error, 'Unsupported to locale N/A', 'should throw an error');
            return done();
        })
    });

    it('should bypass calling service in middleware for non-message activities.', function (done) {
        let intercepted = true;
        let toFrenchSettings = {
            toLocale: 'fr-fr',
            fromLocale: 'en-us'
        }

        const context = new TestContext({ text: 'bonjour', type: 'foo' })
        const localeConverter = new LocaleConverter(toFrenchSettings)
        .onTurn(context, () => {
            intercepted = false;
            Promise.resolve();
        })
        .then(() => {
            assert(!intercepted, 'intercepted');
            done();
        });
    });
})
