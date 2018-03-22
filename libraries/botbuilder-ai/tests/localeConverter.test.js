const assert = require('assert');
const ai = require('../');
const builder = require('botbuilder');
const process =require('process');

describe('LocaleConverter', function () {
    this.timeout(10000);

    it('should convert locale to fr', function (done) {
        
        let toFrenchSettings = {
            toLocale: 'fr-fr',
            fromLocale: 'en-us'
        }

        const testAdapter = new builder.TestAdapter(c => c.sendActivity(c.request.text))
        .use(new ai.LocaleConverter(toFrenchSettings))
        .test('10/21/2018', '21/10/2018', 'should have received date in usa french locale')
        .then(() => done());
    });

    it('should convert locale to chinese using delegate', function (done) {

        let toChineseSettings = {
            toLocale: 'zh-cn',
            getUserLocale: c => 'en-us',
            setUserLocale: c => Promise.resolve(false)
        }

        const testAdapter = new builder.TestAdapter(c => c.sendActivity(c.request.text))
        .use(new ai.LocaleConverter(toChineseSettings))
        .test('10/21/2018', '2018-10-21', 'should have received date in chinese locale')
        .then(() => done());
    });

    it('should support changing locale', function (done) {
        
        let userLocale = 'en-us';

        let changeLocaleSettings = {
            toLocale: 'zh-cn',
            getUserLocale: c => userLocale,
            setUserLocale: c => {
                if (c.request.text == 'Change my locale to fr-fr') {
                    userLocale = 'fr-fr';
                    return Promise.resolve(true);
                }
                return Promise.resolve(false);
            }
        }

        const testAdapter = new builder.TestAdapter(c => assert.equal(userLocale, 'fr-fr', 'should have changed locale variable to fr-fr'))
        .use(new ai.LocaleConverter(changeLocaleSettings))
        .send('Change my locale to fr-fr')
        .then(() => done());
    });

    it('should use en-us as default from locale', function (done) {
        
        let noFromLocaleSettings = {
            toLocale: 'zh-cn',
        }

        const testAdapter = new builder.TestAdapter(c => c.sendActivity(c.request.text))
        .use(new ai.LocaleConverter(noFromLocaleSettings))
        .test('10/21/2018', '2018-10-21', 'should have received date in chinese locale')
        .then(() => done());
    });
})
