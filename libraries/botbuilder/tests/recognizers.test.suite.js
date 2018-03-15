const assert = require('assert');
const builder = require('../');


describe('recognizers', function () {
    this.timeout(5000);

    it('[RegExpRecognizer] should recognize help intent', function (done) {
        const testAdapter = new builder.TestAdapter();

        let helpRecognizer = new builder.RegExpRecognizer({ minScore: 0.0 }).addIntent('HelpIntent', /help/i);

        const bot = new builder.Bot(testAdapter);
        bot.use(helpRecognizer);
        bot.onReceive((context) => {
            if (context.topIntent && context.topIntent.name === 'HelpIntent') {
                context.reply('You selected HelpIntent');
            }
        });

        testAdapter
            .test('help', (activity) => {
                assert(activity.type === 'message');
                assert(activity.text === 'You selected HelpIntent');
            })
            .then(() => done())
            .catch((err) => done(err));
    });

    it('[RegExpRecognizer] should recognize intent via regex', function (done) {
        const testAdapter = new builder.TestAdapter();

        let helpRecognizer = new builder.RegExpRecognizer({ minScore: 0.0 });
        helpRecognizer.addIntent('apple', /apple/i);
        helpRecognizer.addIntent('orange', /orange/i);

        const bot = new builder.Bot(testAdapter);
        bot.use(helpRecognizer);
        bot.onReceive(function onReceiveHandler(context) {
            if (context.topIntent && context.topIntent.name === 'apple') {
                context.reply('You selected apple intent');
            }
            else if (context.topIntent && context.topIntent.name === 'orange') {
                context.reply('You selected orange intent');
            }
            else {
                context.reply('hello');
            }
        });

        testAdapter
            .test('one apple please', 'You selected apple intent')
            .test('one orange please', 'You selected orange intent')
            .then(() => done())
            .catch((err) => done(err));
    });

    it('[RegExpRecognizer] should recognize cancel intent', function (done) {
        const testAdapter = new builder.TestAdapter();

        let cancelRecognizer = new builder.RegExpRecognizer().addIntent('CancelIntent', /cancel/i);

        const bot = new builder.Bot(testAdapter);
        bot.use(cancelRecognizer);
        bot.onReceive((context) => {
            if (context.topIntent && context.topIntent.name === 'CancelIntent') {
                context.reply('You selected CancelIntent');
            }
        });

        testAdapter
            .test('cancel', 'You selected CancelIntent')
            .then(() => done())
            .catch((err) => done(err));
    });

    it('[RegExpRecognizer] should NOT recognize cancel intent', function (done) {
        const testAdapter = new builder.TestAdapter();

        let cancelRecognizer = new builder.RegExpRecognizer().addIntent('CancelIntent', /cancel/i);

        const bot = new builder.Bot(testAdapter);
        bot.use(cancelRecognizer);
        bot.onReceive((context) => {
            if (context.topIntent && context.topIntent.name === 'CancelIntent') {
                context.reply('You selected CancelIntent');
            }

            if (context.request.type === 'message') {
                context.reply('Bot received request of type message');
            } else {
                context.reply(`[${context.request.type} event detected]`);
            }
        });

        testAdapter
            .test('tacos', 'Bot received request of type message')
            .then(() => done())
            .catch((err) => done(err));
    });

    it('[RegExpRecognizer] should handle multiple intents', function (done) {
        const testAdapter = new builder.TestAdapter();

        let multiRecognizer = new builder.RegExpRecognizer();
        multiRecognizer.addIntent('help', /help/i);
        multiRecognizer.addIntent('cancel', /cancel/i);
        multiRecognizer.addIntent('taco', /taco/i);

        const bot = new builder.Bot(testAdapter);
        bot.use(multiRecognizer);
        bot.onReceive((context) => {
            if (context.topIntent && context.topIntent.name === 'help') context.reply('you selected help intent');
            else if (context.topIntent && context.topIntent.name === 'cancel') context.reply('you selected cancel intent');
            else if (context.topIntent && context.topIntent.name === 'taco') context.reply('you selected taco intent');

            else if (context.request.type === 'message') {
                context.reply('Bot received request of type message');
            } else {
                context.reply(`[${context.request.type} event detected]`);
            }
        });

        testAdapter
            .test('help', 'you selected help intent')
            .test('cancel', 'you selected cancel intent')
            .test('taco', 'you selected taco intent')
            .then(() => done())
            .catch((err) => done(err));
    });
});

// END OF LINE
