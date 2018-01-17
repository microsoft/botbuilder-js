const assert = require('assert');
const builder = require('../');

describe('state', function() {
    this.timeout(5000);

    it('should NOT remember context.state.', function (done) { 
        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .onReceive((context) => { 
                assert(context.state, 'context.state should exist');
                switch (context.request.text) {
                    case 'set value':
                        context.state.value = 'test';
                        context.reply('value saved');
                        break;
                    case 'get value':
                        context.reply(context.state.value || 'undefined');
                        break;
                }
            });
        testAdapter.test('set value',  'value saved', 'set value failed')
                 .test('get value',  'undefined', 'get value was undefined')
                 .then(() => done());
    });

    it('Store should remember user state changes.', function (done) { 
        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .use(new builder.MemoryStorage())
            .use(new builder.BotStateManager())
            .onReceive((context) => { 
                assert(context.state.user, 'state.user should exist');
                switch (context.request.text) {
                    case 'set value':
                        context.state.user.value = 'test';
                        context.reply('value saved');
                        break;
                    case 'get value':
                        context.reply(context.state.user.value);
                        break;
                }
            });
        testAdapter.test('set value',  'value saved')
                 .test('get value',  'test')
                 .then(() => done());
    });

    it('Store should remember conversation state changes.', function (done) { 
        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .use(new builder.MemoryStorage())
            .use(new builder.BotStateManager())
            .onReceive((context) => { 
                assert(context.state.conversation, 'state.conversation should exist');
                switch (context.request.text) {
                    case 'set value':
                        context.state.conversation.value = 'test';
                        context.reply('value saved');
                        break;
                    case 'get value':
                        context.reply(context.state.conversation.value);
                        break;
                }
            });
        testAdapter.test('set value',  'value saved')
                 .test('get value',  'test')
                 .then(() => done());
    });
});