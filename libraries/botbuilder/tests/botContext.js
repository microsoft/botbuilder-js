const assert = require('assert');
const builder = require('../');
const BotFrameworkAdapter = require('../../botbuilder-services').BotFrameworkAdapter;

describe('The BotContext', () => {
    describe('should accept a plugin', () => {
        let bot;
        beforeEach(() => {
            const botFrameworkAdapter = new BotFrameworkAdapter({
                appId: process.env.MICROSOFT_APP_ID,
                appPassword: process.env.MICROSOFT_APP_PASSWORD
            });
            bot = new builder.Bot(botFrameworkAdapter);
        });

        it('of a classy type and properly reflect it\'s prototype', () => {
            class A extends builder.BotContext {
                pluginClassAFunction1() {
                }

                pluginClassAFunction2() {
                }
            }

            const a = new A();
            assert.doesNotThrow(() => bot.plugin(a));
            assert(bot.pluginReflectMetadata.has(A.prototype));
            ['pluginClassAFunction1', 'pluginClassAFunction2'].forEach(key => assert(key in bot.pluginReflectMetadata.get(A.prototype)));
        });

        it('as an object literal and properly reflect it\'s properties', () => {
            const obj = {
                objectLiteralFunction1: function () {
                },
                objectLiteralFunction2: function () {
                }
            };

            assert.doesNotThrow(() => bot.plugin(obj));
            assert(bot.pluginReflectMetadata.has(obj));
            ['objectLiteralFunction1', 'objectLiteralFunction2'].forEach(key => assert(key in bot.pluginReflectMetadata.get(obj)));
        });

        it('of a class prototype and properly reflect it\'s properties', () => {
            class A extends builder.BotContext {
                pluginClassPrototypeAFunction1() {
                }

                pluginClassPrototypeAFunction2() {
                }
            }

            assert.doesNotThrow(() => bot.plugin(A.prototype));
            assert(bot.pluginReflectMetadata.has(A.prototype));
            ['pluginClassPrototypeAFunction1', 'pluginClassPrototypeAFunction2'].forEach(key => assert(key in bot.pluginReflectMetadata.get(A.prototype)));
        });
    });

    describe('should proxy the plugin', () => {
        let bot;
        beforeEach(() => {
            const botFrameworkAdapter = new BotFrameworkAdapter({
                appId: process.env.MICROSOFT_APP_ID,
                appPassword: process.env.MICROSOFT_APP_PASSWORD
            });
            bot = new builder.Bot(botFrameworkAdapter);
            bot.plugin(new class {
                pluginFunction1() {
                    return this;
                }
            });
        });

        it('and call the proxied function in the context of the BotContext object', () => {
            class MiddleWare {
                receiveActivity(context) {
                    const value = context.pluginFunction1();
                    assert(value instanceof builder.BotContext);
                }
            }

            bot.use(new MiddleWare());
            bot.receive('hello')
        });

        it('and return an array of functions when a naming collision occurs', () => {
            class MiddleWare {
                receiveActivity(context) {
                    assert(context.pluginFunction1() instanceof Array);
                    context.pluginFunction1().forEach(func => assert.equal(typeof func, 'function'));
                }
            }

            bot.plugin(new class {
                pluginFunction1() {
                    return this;
                }
            });

            bot.use(new MiddleWare());
            bot.receive('hello')
        });

        it('and revoke the context then throw if a function is called after revocation', done => {
            class MiddleWare {
                receiveActivity(context) {
                    setTimeout(() => {
                        assert.throws(() => context.pluginFunction1());
                        done();
                    })
                }
            }

            bot.use(new MiddleWare());
            bot.receive('hello')
        });
    });
});