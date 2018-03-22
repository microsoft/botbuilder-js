const assert = require('assert');
const builder = require('../');
const { ConsoleAdapter } = require('../../botbuilder-node');

describe('Core integration tests', () => {
    describe('console adapter', () => {
        let adapter;
        
        beforeEach(() => adapter = new ConsoleAdapter().listen())

        it('can pipe incoming messages to the bot and see outgoing responses', () => {
            const bot = new builder.Bot(adapter);

            const outgoingMessageSuccessProimse = new Promise((res, rej) => {
                bot.use(new builder.MemoryStorage())
                    .use(new builder.BotStateManager())
                    .use({
                        postActivity: (context, activities, next) => {
                            if(activities.length === 0) {
                                rej('no outgoing activity received');
                                return next();
                            }

                            const text = activities[1].text;

                            assert.equal(text, 'HELLO!');

                            return next();
                        }
                    });
                });
            
            bot.onReceive((context) => {
                context.reply('HELLO!');
            });

            adapter.receive('hey');

            return outgoingMessageSuccessProimse;
        })
    });
})