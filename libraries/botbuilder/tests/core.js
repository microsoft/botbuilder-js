const assert = require('assert');
const builder = require('../');

describe('bot', function () {
    this.timeout(5000);
    it('should process a received message.', function (done) {
        let tests = 0;
        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter).onReceive((context) => {
            assert(context);
            assert(context.request);
            assert(context.responses);
            assert(context.request.type == 'message');
            switch (context.request.text) {
                case 'foo':
                    context.responses.push({ text: 'bar' });
                    return { handled: true };
                case 'bar':
                    context.responses.push({ text: 'foo' });
                    return { handled: true };
                default:
                    assert(false, `Invalid text of '${context.request.text}'`);
                    return { handled: false };
            }
        });
        testAdapter.send('foo').assertReply((a) => {
            tests++;
            assert(a.text == 'bar');
        })
            .send('bar').assertReply((a) => {
                tests++;
                assert(a.text == 'foo');
            })
            .then(() => {
                assert(tests === 2);
                done();
            });
    });
});

describe('middleware', function () {
    this.timeout(5000);
    it('should call contextCreated middleware.', function (done) {
        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .use({
                contextCreated: (context, next) => {
                    context.responses.push({ text: 'called' });
                    return next();
                }
            })
            .onReceive((context) => {
                assert(context.responses.length == 1);
            });
        testAdapter.send('foo').assertReply('called')
            .then(() => done());
    });

    it('should call receiveActivity middleware.', function (done) {
        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .use({
                receiveActivity: (context, next) => {
                    context.responses.push({ text: 'called' });
                    return next();
                }
            })
            .onReceive((context) => {
                assert(context.responses.length == 1);
            });
        testAdapter.send('foo').assertReply('called')
            .then(() => done());
    });

    it('should call postActivity middleware.', function (done) {
        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .use({
                postActivity: (context, activities, next) => {
                    assert(activities);
                    assert(activities.length == 1);
                    assert(activities[0].text == 'foo');
                    activities[0].text = 'called';
                    return next();
                }
            })
            .onReceive((context) => {
                context.responses.push({ text: context.request.text })
            });
        testAdapter.send('foo').assertReply('called')
            .then(() => done());
    });

    it('should aggregate over multiple receivers.', function (done) {
        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .onReceive(
                (context) => {
                    if (context.request.text === 'a') {
                        context.responses.push({ text: 'a' });
                    }
                },
                (context) => {
                    if (!context.responded) {
                        assert(context.request.text === 'b');
                        context.responses.push({ text: 'b' });
                    }
                }
            );
        testAdapter.send('a').assertReply('a')
            .send('b').assertReply('b')
            .then(() => done());
    });
});

describe('context', function () {
    this.timeout(5000);
    it('should reply() a message with just text.', function (done) {
        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .onReceive((context) => {
                context.reply('test');
            });
        testAdapter.send('hi').assertReply('test')
            .then(() => done());
    });

    it('should reply() a message with text+ssml.', function (done) {
        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .onReceive((context) => {
                context.reply('test', 'ssml');
            });
        testAdapter.send('hi')
            .assertReply((a) => {
                assert(a.type == 'message');
                assert(a.text == 'test');
                assert(a.speak == 'ssml');
            })
            .then(() => done());
    });

    it('should reply() a message with text+attachments.', function (done) {
        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .onReceive((context) => {
                context.reply('test', { attachments: [{ contentType: 'text' }] });
            });
        testAdapter.test('hi', (a) => {
            assert(a.type == 'message');
            assert(a.text == 'test');
            assert(a.attachments);
            assert(a.attachments.length == 1);
            assert(a.attachments[0]);
            assert(a.attachments[0].contentType === 'text');
        })
            .then(() => done());
    });

    it('should reply() a message with text+ssml+attachments.', function (done) {
        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .onReceive((context) => {
                context.reply('test', 'ssml', { attachments: [{ contentType: 'text' }] });
            });
        testAdapter.test('hi', (a) => {
            assert(a.type == 'message');
            assert(a.text == 'test');
            assert(a.speak == 'ssml');
            assert(a.attachments);
            assert(a.attachments.length == 1);
            assert(a.attachments[0]);
            assert(a.attachments[0].contentType === 'text');
        })
            .then(() => done());
    });

    it('should reply() with a custom activity.', function (done) {
        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .onReceive((context) => {
                context.reply({ type: 'test' });
            });
        testAdapter.test('hi', (a) => {
            assert(a.type == 'test');
        })
            .then(() => done());
    });

    it('should add a delay()', function (done) {
        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .onReceive((context) => {
                context.delay(2000);
            });
        testAdapter.test('hi', (a) => {
            assert(a.type === 'delay');
            assert(a.value === 2000);
        })
            .then(() => done());
    });

    it('should work to proactively send reply()', function (done) {
        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .onReceive((context) => {
                // in 500 ms send proactive response
                setTimeout(() => {
                    bot.createContext(context.request, (proactiveContext) => {
                        proactiveContext.reply('hello');
                    })
                }, 500);
            });
        testAdapter.send('hi').assertReply('hello')
            .then(() => done());
    });


    it('should showTyping() indicator', function (done) {
        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .onReceive((context) => {
                context.showTyping();
            });
        testAdapter.test('hi', (a) => {
            assert(a.type === 'typing');
        })
            .then(() => done());
    });

    it('should send endOfConversation()', function (done) {
        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .onReceive((context) => {
                context.endOfConversation();
            });
        testAdapter.test('hi', (a) => {
            assert(a.type === 'endOfConversation');
            assert(a.code === builder.EndOfConversationCodes.completedSuccessfully)
        })
            .then(() => done());
    });

    it('should send endOfConversation() with a custom code', function (done) {
        const code = builder.EndOfConversationCodes.botTimedOut;
        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .onReceive((context) => {
                context.endOfConversation(code);
            });
        testAdapter.test('hi', (a) => {
            assert(a.type === 'endOfConversation');
            assert(a.code === code);
        })
            .then(() => done());
    });

    it('should findEntities() of a specific type', function (done) {
        const code = builder.EndOfConversationCodes.botTimedOut;
        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .use({
                receiveActivity: (ctx, next) => {
                    ctx.topIntent = {
                        name: 'BookFlight',
                        score: 1.0,
                        entities: [
                            { type: 'fromCity', value: 'seattle' },
                            { type: 'toCity', value: 'boston' },
                            { type: 'date', value: '9/20/2017' }
                        ]
                    };
                    return next();
                }
            })
            .onReceive((context) => {
                let msg = 'I found ';
                let testAdapter = '';
                context.findEntities('fromCity').forEach((entity) => {
                    msg += testAdapter + entity.value;
                    testAdapter = ' and ';
                })
                context.reply(msg);
            });
        testAdapter.send('book flight').assertReply('I found seattle')
            .then(() => done());
    });

    it('should findEntities() using a pattern', function (done) {
        const code = builder.EndOfConversationCodes.botTimedOut;
        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .use({
                receiveActivity: (ctx, next) => {
                    ctx.topIntent = {
                        name: 'BookFlight',
                        score: 1.0,
                        entities: [
                            { type: 'fromCity', value: 'seattle' },
                            { type: 'toCity', value: 'boston' },
                            { type: 'date', value: '9/20/2017' }
                        ]
                    };
                    return next();
                }
            })
            .onReceive((context) => {
                let msg = 'I found ';
                let testAdapter = '';
                context.findEntities(/.*City/).forEach((entity) => {
                    msg += testAdapter + entity.value;
                    testAdapter = ' and ';
                });
                context.reply(msg);
            });
        testAdapter.send('book flight')
            .assertReply('I found seattle and boston')
            .then(() => done());
    });

    it('should return the value of the first match using getEntity()', function (done) {
        const code = builder.EndOfConversationCodes.botTimedOut;
        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .use({
                receiveActivity: (ctx, next) => {
                    ctx.topIntent = {
                        name: 'BookFlight',
                        score: 1.0,
                        entities: [
                            { type: 'fromCity', value: 'seattle' },
                            { type: 'toCity', value: 'boston' },
                            { type: 'date', value: '9/20/2017' }
                        ]
                    };
                    return next();
                }
            })
            .onReceive((context) => {
                const value = context.getEntity(/.*City/);
                context.reply(`I found ${value}`);
            });
        testAdapter.send('book flight').assertReply('I found seattle')
            .then(() => done());
    });

    it('should return the value of the second match using getEntity()', function (done) {
        const code = builder.EndOfConversationCodes.botTimedOut;
        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .use({
                receiveActivity: (ctx, next) => {
                    ctx.topIntent = {
                        name: 'BookFlight',
                        score: 1.0,
                        entities: [
                            { type: 'fromCity', value: 'seattle' },
                            { type: 'toCity', value: 'boston' },
                            { type: 'date', value: '9/20/2017' }
                        ]
                    };
                    return next();
                }
            })
            .onReceive((context) => {
                const value = context.getEntity(/.*City/, 1);
                context.reply(`I found ${value}`);
            });
        testAdapter.send('book flight').assertReply('I found boston')
            .then(() => done());
    });

    it('should send a batch of activities', function (done) {
        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .onReceive((context) => {
                context.showTyping().delay(2000).reply('test');
            });
        testAdapter.send('hi')
            .assertReply((a) => {
                assert(a.type === 'typing');
            })
            .assertReply((a) => {
                assert(a.type === 'delay');
            })
            .assertReply((a) => {
                assert(a.type === 'message');
                assert(a.text === 'test');
            })
            .then(() => done());
    });

    it('should flush responses', function (done) {
        let batch = 0;
        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .onReceive((context) => {
                return context.showTyping().delay(2000).reply('foo').sendResponses().then((r) => {
                    assert(context.responses.length === 0, `Invalid responses length of ${context.responses.length}`);
                    batch = 1;
                    context.reply('bar');
                    return { handled: true };
                });
            });
        testAdapter.send('hi')
            .assertReply((a) => assert(a.type === 'typing'), 'No typing sent', 3000)
            .assertReply((a) => assert(a.type === 'delay'), 'No delay sent', 3000)
            .assertReply('foo')
            .assertReply('bar')
            .then(() => {
                assert(batch === 1, "Batch not sent.");
                done()
            });
    });

    it('should flush changes even when no responses', function (done) {
        let batch = 0;
        const testAdapter = new builder.TestAdapter();
        const bot = new builder.Bot(testAdapter)
            .use({
                postActivity: (context, activities, next) => {
                    batch = 1;
                    return next();
                } 
            })
            .onReceive((context) => {
                return context.sendResponses().then((r) => {
                    assert(batch === 1, `Changes not flushed.`);
                    batch = 2;
                    context.reply('bar');
                    return { handled: true };
                });
            });
        testAdapter.send('hi')
            .assertReply('bar')
            .then(() => done());
    });
});
