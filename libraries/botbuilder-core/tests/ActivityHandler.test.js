const assert = require('assert');
const { ActivityHandler, TurnContext, AutoSaveStateMiddleware, TestAdapter } = require('../lib');

describe('ActivityHandler', function() {

    const adapter = new TestAdapter();

    async function processActivity(activity, bot) {
        const context = new TurnContext(adapter, activity);
        await bot.run(context);
    }

    it(`should fire onTurn for any inbound activity`, async function (done) {

        const bot = new ActivityHandler();

        bot.onTurn(async(context, next) => {
            assert(true, 'onTurn not called');
            done();
        });

        processActivity({type: 'any'}, bot);
    });

    it(`should fire onMessage for any message activities`, async function (done) {

        const bot = new ActivityHandler();

        bot.onMessage(async(context, next) => {
            assert(true, 'onMessage not called');
            done();
        });

        processActivity({type: 'message'}, bot);
    });

});