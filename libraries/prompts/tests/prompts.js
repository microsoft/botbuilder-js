var assert = require('assert');
var path = require('path');
var { Bot, TestAdapter, MemoryStorage, BotStateManager } = require('botbuilder-core');
var { Prompt, TextPrompt, AttachmentPrompt, ConfirmPrompt, NumberPrompt, ChoicePrompt } = require('../');

function setupBot(receiver) {
    const adapter = new TestAdapter();
    const bot = new Bot(adapter)
        .use(new MemoryStorage())
        .use(new BotStateManager())
        .onReceive(receiver);
    return adapter;
}

describe('Prompts', function() {
    this.timeout(5000);
   
    it('should create and configure a new prompt.', function (done) {
        function verifyPrompt(p) {
            assert(p);
            assert(p.uid === 'testPrompt');
            assert(p.begin);
            assert(p.cancel);
            assert(p.reply);
            assert(p.set);
            assert(p.with);
        }

        Prompt.unregisterAll();
        const tp = new Prompt('testPrompt', (context, state) => undefined, (context, state) => undefined);
        verifyPrompt(tp);
        assert(tp._options.prompt === undefined);
        assert(tp._options.rePrompt === undefined);
        assert(tp._with);

        // Set prompt
        const tp2 = tp.reply('test');
        assert(!tp._options.prompt);
        assert(tp2._options.prompt);

        // Set rePrompt
        const tp3 = tp2.set({ rePrompt: { text: 'test' }});
        assert(!tp2._options.rePrompt);
        assert(tp3._options.rePrompt);
        assert(tp3._options.prompt);
        
        // Set with args
        const tp4 = tp3.with({ 'arg': true });
        assert(!tp3._with.hasOwnProperty('arg'));
        assert(tp4._with.hasOwnProperty('arg'));
        done();
    });

    it('should call a prompts validator and completion handler.', function (done) {
        Prompt.unregisterAll();

        function dateValidator(context, state) {
            const timestamp = Date.parse(context.request.text || '');
            if (!Number.isNaN(timestamp)) {
                return { value: new Date(timestamp) };
            }
            return { error: 'invalid' };
        }

        const datePrompt = new Prompt('datePrompt', dateValidator, (context, state) => {
            const date = state.value;
            assert(date instanceof Date, `Invalid value returned.`); 
            context.reply(date.toDateString());
        });
        
        setupBot((context) => {
            if (context.ifRegExp(/start/i)) {
                context.begin(datePrompt.reply(`enter a valid date`));
            } else {
                return Prompt.routeTo(context).then((handled) => {
                    if (!handled) { context.reply('not started') }
                })
            }
        })
        .test('start', 'enter a valid date', '1')
        .test('test', 'enter a valid date', '2')
        .test('12/1/2017', 'Fri Dec 01 2017')
        .test('hi', 'not started')
        .then(() => done());
    });
});

describe('TextPrompt', function() {
    this.timeout(5000);

    it('should trim the users input.', function (done) {
        Prompt.unregisterAll();
        const testPrompt = new TextPrompt('testPrompt', (context, state) => { 
            context.reply(state.value); 
        });
        
        setupBot((context) => {
            if (context.ifRegExp(/start/i)) {
                context.begin(testPrompt.reply(`started`));
            } else {
                return Prompt.routeTo(context).then((handled) => {
                    if (!handled) { context.reply('not started') }
                })
            }
        })
        .test('start', 'started')
        .test(' input  with  spaces ', 'input  with  spaces')
        .test('hi', 'not started')
        .then(() => done());
    });

    it('should NOT trim the users input.', function (done) {
        Prompt.unregisterAll();
        const testPrompt = new TextPrompt('testPrompt', (context, state) => { 
            context.reply(state.value); 
        });
        
        setupBot((context) => {
            if (context.ifRegExp(/start/i)) {
                context.begin(testPrompt.set({ trimReply: false }).reply(`started`));
            } else {
                return Prompt.routeTo(context).then((handled) => {
                    if (!handled) { context.reply('not started') }
                })
            }
        })
        .test('start', 'started')
        .test(' input  with  spaces ', ' input  with  spaces ')
        .test('hi', 'not started')
        .then(() => done());
    });

    it('should let you customize re-prompting.', function (done) {
        Prompt.unregisterAll();
        const testPrompt = new TextPrompt('testPrompt', (context, state) => { 
            context.reply(state.value); 
        }, (context, state) => {
            context.reply(`turns: ${state.turns}`);
        });
        
        setupBot((context) => {
            if (context.ifRegExp(/start/i)) {
                context.begin(testPrompt.reply(`started`));
            } else {
                return Prompt.routeTo(context).then((handled) => {
                    if (!handled) { context.reply('not started') }
                })
            }
        })
        .test('start', 'turns: 0')
        .test('foo', 'foo')
        .test('hi', 'not started')
        .then(() => done());
    });
});

describe('AttachmentPrompt', function() {
    this.timeout(5000);

    it('should prompt to upload a file.', function (done) {
        Prompt.unregisterAll();
        const testPrompt = new AttachmentPrompt('testPrompt', (context, state) => {
            const attachments = state.value;
            assert(Array.isArray(attachments));
            context.reply(`you sent ${attachments.length} files`); 
        });
    
        setupBot((context) => {
            if (context.ifRegExp(/start/i)) {
                context.begin(testPrompt.reply(`upload file`));
            } else {
                return Prompt.routeTo(context).then((handled) => {
                    if (!handled) { context.reply('not started') }
                })
            }
        })
        .test('start', 'upload file')
        .send({ type:'message', attachments: [{ contentType: 'test' }]}).assertReply('you sent 1 files')
        .then(() => done());
    });

    it('should re-prompt on invalid input.', function (done) {
        Prompt.unregisterAll();
        const testPrompt = new AttachmentPrompt('testPrompt', (context, state) => {
            const attachments = state.value;
            assert(Array.isArray(attachments));
            context.reply(`you sent ${attachments.length} files`); 
        });
        
        setupBot((context) => {
            if (context.ifRegExp(/start/i)) {
                context.begin(testPrompt.reply(`upload file`));
            } else {
                return Prompt.routeTo(context).then((handled) => {
                    if (!handled) { context.reply('not started') }
                })
            }
        })
        .test('start', 'upload file')
        .test('ok', "I didn't receive a file. Please try again.")
        .send({ type:'message', attachments: [{ contentType: 'test' }]}).assertReply('you sent 1 files')
        .then(() => done());
    });
});

describe('ConfirmPrompt', function() {
    this.timeout(5000);

    it('should prompt for a confirmation.', function (done) {
        Prompt.unregisterAll();
        const testPrompt = new ConfirmPrompt('testPrompt', (context, state) => {
            const value = state.value;
            assert(typeof value === 'boolean');
            context.reply(value.toString()); 
        });
        
        setupBot((context) => {
            if (context.ifRegExp(/start/i)) {
                context.begin(testPrompt.reply(`yes or no`));
            } else {
                return Prompt.routeTo(context).then((handled) => {
                    if (!handled) { context.reply('not started') }
                })
            }
        })
        .test('start', 'yes or no')
        .test('sure', 'true')
        .test('start', 'yes or no')
        .test('nope', 'false')
        .then(() => done());
    });

    it('should re-prompt on invalid input.', function (done) {
        Prompt.unregisterAll();
        const testPrompt = new ConfirmPrompt('testPrompt', (context, state) => {
            const value = state.value;
            assert(typeof value === 'boolean');
            context.reply(value.toString()); 
        });
        
        setupBot((context) => {
            if (context.ifRegExp(/start/i)) {
                context.begin(testPrompt.reply(`yes or no`));
            } else {
                return Prompt.routeTo(context).then((handled) => {
                    if (!handled) { context.reply('not started') }
                })
            }
        })
        .test('start', 'yes or no')
        .test('hmm', "I didn't understand. Please answer 'yes' or 'no'.")
        .test('sure', 'true')
        .then(() => done());
    });

    it('should allow complex responses.', function (done) {
        Prompt.unregisterAll();
        const testPrompt = new ConfirmPrompt('testPrompt', (context, state) => {
            const value = state.value;
            assert(typeof value === 'boolean');
            context.reply(value.toString()); 
        });
        
        setupBot((context) => {
            if (context.ifRegExp(/start/i)) {
                context.begin(testPrompt.reply(`yes or no`));
            } else {
                return Prompt.routeTo(context).then((handled) => {
                    if (!handled) { context.reply('not started') }
                })
            }
        })
        .test('start', 'yes or no')
        .test("I think that would work. so yes I will.", 'true')
        .test('start', 'yes or no')
        .test("I don't thing so. no.", 'false')
        .then(() => done());
    });
});

describe('NumberPrompt', function() {
    this.timeout(5000);

    it('should prompt for a numeric value.', function (done) {
        Prompt.unregisterAll();
        const testPrompt = new NumberPrompt('testPrompt', (context, state) => {
            const value = state.value;
            assert(typeof value === 'number');
            context.reply(value.toString()); 
        });
        
        setupBot((context) => {
            if (context.ifRegExp(/start/i)) {
                context.begin(testPrompt.reply(`enter a number`));
            } else {
                return Prompt.routeTo(context).then((handled) => {
                    if (!handled) { context.reply('not started') }
                })
            }
        })
        .test('start', 'enter a number')
        .test('42', '42')
        .then(() => done());
    });

    it('should re-prompt on invalid input.', function (done) {
        Prompt.unregisterAll();
        const testPrompt = new NumberPrompt('testPrompt', (context, state) => {
            const value = state.value;
            assert(typeof value === 'number');
            context.reply(value.toString()); 
        });
        
        setupBot((context) => {
            if (context.ifRegExp(/start/i)) {
                context.begin(testPrompt.reply(`enter a number`));
            } else {
                return Prompt.routeTo(context).then((handled) => {
                    if (!handled) { context.reply('not started') }
                })
            }
        })
        .test('start', 'enter a number')
        .test('hmm', "I didn't recognize that as a number. Please enter a number.")
        .test('42', '42')
        .then(() => done());
    });

    it('should allow complex responses.', function (done) {
        Prompt.unregisterAll();
        const testPrompt = new NumberPrompt('testPrompt', (context, state) => {
            const value = state.value;
            assert(typeof value === 'number');
            context.reply(value.toString()); 
        });
        
        setupBot((context) => {
            if (context.ifRegExp(/start/i)) {
                context.begin(testPrompt.reply(`enter a number`));
            } else {
                return Prompt.routeTo(context).then((handled) => {
                    if (!handled) { context.reply('not started') }
                })
            }
        })
        .test('start', 'enter a number')
        .test("Can you give me 42 of them.", '42')
        .test('start', 'enter a number')
        .test("I'll take one of them.", '1')
        .test('start', 'enter a number')
        .test("zero please.", '0')
        .test('start', 'enter a number')
        .test("nine", '9')
        .then(() => done());
    });
    
    it('should only allow whole numbers.', function (done) {
        Prompt.unregisterAll();
        const testPrompt = new NumberPrompt('testPrompt', (context, state) => {
            const value = state.value;
            assert(typeof value === 'number');
            context.reply(value.toString()); 
        });
        
        setupBot((context) => {
            if (context.ifRegExp(/start/i)) {
                context.begin(testPrompt.set({ integerOnly: true }).reply(`enter a number`));
            } else {
                return Prompt.routeTo(context).then((handled) => {
                    if (!handled) { context.reply('not started') }
                })
            }
        })
        .test('start', 'enter a number')
        .test('42.999', "The number you entered was not an integer. Please enter a number without a decimal mark.")
        .test('42', '42')
        .then(() => done());
    });

    it('should only allow numbers above a minValue.', function (done) {
        Prompt.unregisterAll();
        const testPrompt = new NumberPrompt('testPrompt', (context, state) => {
            const value = state.value;
            assert(typeof value === 'number');
            context.reply(value.toString()); 
        });
        
        setupBot((context) => {
            if (context.ifRegExp(/start/i)) {
                context.begin(testPrompt.set({ minValue: 7 }).reply(`enter a number`));
            } else {
                return Prompt.routeTo(context).then((handled) => {
                    if (!handled) { context.reply('not started') }
                })
            }
        })
        .test('start', 'enter a number')
        .test('-8', "The number you entered was below the minimum allowed value of 7. Please enter a valid number.")
        .test('42', '42')
        .then(() => done());
    });

    it('should only allow numbers below a maxValue.', function (done) {
        Prompt.unregisterAll();
        const testPrompt = new NumberPrompt('testPrompt', (context, state) => {
            const value = state.value;
            assert(typeof value === 'number');
            context.reply(value.toString()); 
        });
        
        setupBot((context) => {
            if (context.ifRegExp(/start/i)) {
                context.begin(testPrompt.set({ maxValue: 50 }).reply(`enter a number`));
            } else {
                return Prompt.routeTo(context).then((handled) => {
                    if (!handled) { context.reply('not started') }
                })
            }
        })
        .test('start', 'enter a number')
        .test('100', "The number you entered was above the maximum allowed value of 50. Please enter a valid number.")
        .test('42', '42')
        .then(() => done());
    });

    it('should only allow numbers within a set range.', function (done) {
        Prompt.unregisterAll();
        const testPrompt = new NumberPrompt('testPrompt', (context, state) => {
            const value = state.value;
            assert(typeof value === 'number');
            context.reply(value.toString()); 
        });
        
        setupBot((context) => {
            if (context.ifRegExp(/start/i)) {
                context.begin(testPrompt.set({ minValue: 40, maxValue: 50 }).reply(`enter a number`));
            } else {
                return Prompt.routeTo(context).then((handled) => {
                    if (!handled) { context.reply('not started') }
                })
            }
        })
        .test('start', 'enter a number')
        .test('100', "The number you entered was outside the allowed range of 40 to 50. Please enter a valid number.")
        .test('42', '42')
        .then(() => done());
    });
});

describe('ChoicePrompt', function() {
    this.timeout(5000);

    it('should prompt for a choice.', function (done) {
        Prompt.unregisterAll();
        const testPrompt = new ChoicePrompt('testPrompt', (context, state) => {
            const value = state.value;
            assert(typeof value === 'string');
            context.reply(value.toString()); 
        });
        
        setupBot((context) => {
            if (context.ifRegExp(/start/i)) {
                context.begin(testPrompt.choices(['red','blue','green']).reply('pick a color'));
            } else {
                return Prompt.routeTo(context).then((handled) => {
                    if (!handled) { context.reply('not started') }
                })
            }
        })
        .test('start', 'pick a color (1. red, 2. blue, or 3. green)')
        .test('blue', 'blue')
        .then(() => done());
    });


    it('should re-prompt on invalid input.', function (done) {
        Prompt.unregisterAll();
        const testPrompt = new ChoicePrompt('testPrompt', (context, state) => {
            const value = state.value;
            assert(typeof value === 'string');
            context.reply(value.toString()); 
        });
        
        setupBot((context) => {
            if (context.ifRegExp(/start/i)) {
                context.begin(testPrompt.choices(['red','blue','green']).reply('pick a color'));
            } else {
                return Prompt.routeTo(context).then((handled) => {
                    if (!handled) { context.reply('not started') }
                })
            }
        })
        .test('start', 'pick a color (1. red, 2. blue, or 3. green)')
        .test('pink', "I didn't understand. Please choose an option from the list. (1. red, 2. blue, or 3. green)")
        .test('red', 'red')
        .then(() => done());
    });

    it('should allow complex responses.', function (done) {
        Prompt.unregisterAll();
        const testPrompt = new ChoicePrompt('testPrompt', (context, state) => {
            const value = state.value;
            assert(typeof value === 'string');
            context.reply(value.toString()); 
        });
        
        setupBot((context) => {
            if (context.ifRegExp(/start/i)) {
                context.begin(testPrompt.choices(['red','blue','green']).reply('pick a color'));
            } else {
                return Prompt.routeTo(context).then((handled) => {
                    if (!handled) { context.reply('not started') }
                })
            }
        })
        .test('start', 'pick a color (1. red, 2. blue, or 3. green)')
        .test('how about green', 'green')
        .then(() => done());
    });    

    it('should recognize by index.', function (done) {
        Prompt.unregisterAll();
        const testPrompt = new ChoicePrompt('testPrompt', (context, state) => {
            const value = state.value;
            assert(typeof value === 'string');
            context.reply(value.toString()); 
        });
        
        setupBot((context) => {
            if (context.ifRegExp(/start/i)) {
                context.begin(testPrompt.choices(['red','blue','green']).reply('pick a color'));
            } else {
                return Prompt.routeTo(context).then((handled) => {
                    if (!handled) { context.reply('not started') }
                })
            }
        })
        .test('start', 'pick a color (1. red, 2. blue, or 3. green)')
        .test('1', 'red')
        .test('start', 'pick a color (1. red, 2. blue, or 3. green)')
        .test('3', 'green')
        .then(() => done());
    });    

    it('should recognize by ordinal.', function (done) {
        Prompt.unregisterAll();
        const testPrompt = new ChoicePrompt('testPrompt', (context, state) => {
            const value = state.value;
            assert(typeof value === 'string');
            context.reply(value.toString()); 
        });
        
        setupBot((context) => {
            if (context.ifRegExp(/start/i)) {
                context.begin(testPrompt.choices(['red','blue','green']).reply('pick a color'));
            } else {
                return Prompt.routeTo(context).then((handled) => {
                    if (!handled) { context.reply('not started') }
                })
            }
        })
        .test('start', 'pick a color (1. red, 2. blue, or 3. green)')
        .test('the first one', 'red')
        .test('start', 'pick a color (1. red, 2. blue, or 3. green)')
        .test('the last one', 'green')
        .test('start', 'pick a color (1. red, 2. blue, or 3. green)')
        .test('second from last', 'blue')
        .test('start', 'pick a color (1. red, 2. blue, or 3. green)')
        .test('next to last', 'blue')
        .test('start', 'pick a color (1. red, 2. blue, or 3. green)')
        .test('second from last one', 'blue')
        .test('start', 'pick a color (1. red, 2. blue, or 3. green)')
        .test('second one', 'blue')
        .then(() => done());
    });    
});
