const assert = require('assert');
const ai = require('../');
const builder = require('botbuilder');
const process =require('process');

describe('LocaleConverter', function () {
    this.timeout(10000);

    it('should convert locale to fr', function (done) {
        const testAdapter = new builder.TestAdapter(c => c.sendActivity(c.request.text))
        .use(new ai.LocaleConverter('fr-fr', 'en-us'))
        .send('10/21/2018')
        .assertReply('21/10/2018', 'should have received date in usa french locale')
        .then(() => done());
    });

    it('should convert locale to chinese using delegate', function (done) {
        const testAdapter = new builder.TestAdapter(c => c.sendActivity(c.request.text))
        .use(new ai.LocaleConverter('zh-cn', c => 'en-us', c => Promise.resolve(false)))
        .send('10/21/2018')
        .assertReply('2018-10-21', 'should have received date in chinese locale')
        .then(() => done());
    });

    it('should support changing locale', function (done) {
        let userLocale = 'en-us';
        const testAdapter = new builder.TestAdapter(c => assert.equal(userLocale, 'fr-fr', 'should have changed locale variable to fr-fr'))
        .use(new ai.LocaleConverter('zh-cn', c => userLocale, c => {
            if (c.request.text == 'Change my locale to fr-fr') {
                userLocale = 'fr-fr';
                return Promise.resolve(true);
            }
            return Promise.resolve(false);
        }))
        .send('Change my locale to fr-fr')
        .then(() => done());
    });
})
