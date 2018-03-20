const assert = require('assert');
const ai = require('../');
const builder = require('botbuilder');
const process =require('process');

describe('LocaleConverter', function () {
    this.timeout(10000);

    it('should convert locale to fr', function (done) {
        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .use(new builder.MemoryStorage())
            .use(new builder.BotStateManager())
            .use(new ai.LocaleConverter('fr-fr', 'en-us'))
            .onReceive((context) => {
                context.reply(context.request.text)
            });
        testAdapter.test('10/21/2018', '21/10/2018', 'should have received date in french locale')
            .then(() => done());
    });

    it('should convert locale to chinese using delegate', function (done) {
        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .use(new builder.MemoryStorage())
            .use(new builder.BotStateManager())
            .use(new ai.LocaleConverter('zh-cn', c => 'en-us', c => Promise.resolve(false)))
            .onReceive((context) => {
                context.reply(context.request.text)
            });
        testAdapter.test('10/21/2018', '2018-10-21', 'should have received date in chinese locale')
            .then(() => done());
    });
})
