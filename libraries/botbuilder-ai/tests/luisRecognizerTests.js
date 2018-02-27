const assert = require('assert');
const ai = require('../');
const builder = require('botbuilder');

const luisAppId = process.env.LUISAPPID;
const subscriptionKey = process.env.LUISAPPKEY;

describe('LuisRecognizer', function () {
    this.timeout(10000);
    
    if (!luisAppId) 
    {
        console.warn('WARNING: skipping LuisRecognizer test suite because LUISAPPID environment variable is not defined');
        return;
    }
    if (!subscriptionKey) 
    {
        console.warn('WARNING: skipping LuisRecognizer test suite because LUISAPPKEY environment variable is not defined');
        return;
    }

    it('should return top intent and entities', function (done) {
        var recognizer = new ai.LuisRecognizer({ appId: luisAppId, subscriptionKey: subscriptionKey });
        var context = { request: { text: 'I want ham and cheese sandwich!' } };
        recognizer.recognize(context)
            .then(res => {
                assert(res);
                assert(res.length == 1);
                assert(res[0].name == 'sandwichorder');
                assert(res[0].entities.length > 0);
                assert(res[0].entities[0].type = 'meat');
                assert(res[0].entities[0].value = 'ham');
                done();
            });
    });

    it('static recognize should return top intent', function (done) {
        ai.LuisRecognizer.recognize("hello", { appId: luisAppId, subscriptionKey: subscriptionKey })
            .then(res => {
                assert(res);
                assert(res.name != '');
                assert(res.entities.length == 0);
                done();
            });
    });

    it('should have top intent populated.', function (done) {
        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .use(new builder.MemoryStorage())
            .use(new builder.BotStateManager())
            .use(new ai.LuisRecognizer({ appId: luisAppId, subscriptionKey: subscriptionKey }))
            .onReceive((context) => {
                context.reply(context.topIntent.name);
            });
        testAdapter.send('I want ham and cheese sandwich!')
            .assertReply('sandwichorder', 'should have sandwichorder as top intent!')
            .then(() => done());
    });

})
