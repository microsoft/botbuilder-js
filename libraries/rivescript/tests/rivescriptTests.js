const assert = require('assert');
const rs = require('../');
const builder = require('botbuilder-core');
const process = require('process');
const path = require('path');

describe('RiveScriptReceiver', function () {
    it('Load and execute basic scripts', function (done) {
        const adapter = new builder.TestAdapter();
        const bot = new builder.Bot(adapter)
            .use(new builder.MemoryStorage())
            .use(new builder.BotStateManager())
            .use(new rs.RiveScriptReceiver(path.join(__dirname, 'test.rive'), {}));
        adapter
            .send('hello bot').assertReply('Hello human!')
            .then(() => done());
    });

    it('Load and execute complex scripts', function (done) {
        const adapter = new builder.TestAdapter();
        const bot = new builder.Bot(adapter)
            .use(new builder.MemoryStorage())
            .use(new builder.BotStateManager())
            .use(new rs.RiveScriptReceiver(path.join(__dirname, 'complex.rive'), {}));
        adapter
            .send('my name is Tom')
            .assertReplyOneOf(['Nice to meet you, Tom.', 'Tom, nice to meet you.'], 'remember something')
            .send('what is my name?')
            .assertReplyOneOf([
                'Your name is Tom.',
                'You told me your name is Tom.',
                'Aren\'t you Tom?'], 'memory test')
            .then(() => done());
    });

    let complexRivescript = new rs.RiveScriptReceiver(path.join(__dirname, 'complex.rive'), {});
    it('routeToRiveScript simple', function (done) {
        const adapter = new builder.TestAdapter();
        const bot = new builder.Bot(adapter)
            .use(new builder.MemoryStorage())
            .use(new builder.BotStateManager())
            .onReceive((context) => complexRivescript.receiveActivity(context, () => Promise.resolve()));
        adapter
            .send('my name is Tom')
            .assertReplyOneOf([
                'Nice to meet you, Tom.',
                'Tom, nice to meet you.'], 'remember something')
            .send('what is my name?')
            .assertReplyOneOf([
                'Your name is Tom.',
                'You told me your name is Tom.',
                'Aren\'t you Tom?'], 'memory test')
            .then(() => done());
    });

    it('routeToRiveScript complex', function (done) {
        const adapter = new builder.TestAdapter();
        const bot = new builder.Bot(adapter)
            .use(new builder.MemoryStorage())
            .use(new builder.BotStateManager())
            .onReceive((context) => {
                if (context.ifRegExp(/before/i)) {
                    context.reply('first');
                }
                else {
                    return complexRivescript.receiveActivity(context, () => {
                        if (!context.responded && context.ifRegExp(/after/i)) {
                            context.reply('last');
                        }
                        return Promise.resolve();
                    })
                }
            });
        adapter
            .send('before')
            .assertReply('first', 'test routes before rivescript')
            .send('my name is Tom')
            .assertReplyOneOf([
                'Nice to meet you, Tom.',
                'Tom, nice to meet you.'], 'remember something')
            .send('what is my name?')
            .assertReplyOneOf([
                'Your name is Tom.',
                'You told me your name is Tom.',
                'Aren\'t you Tom?'], 'memory test')
            .send('after')
            .assertReply('last', 'test routes after rivescript')
            .then(() => done());
    });

    it('two routerToRiveScript', function (done) {
        let rs1 = new rs.RiveScriptReceiver(path.join(__dirname, 'test.rive'), {});
        let rs2 = new rs.RiveScriptReceiver(path.join(__dirname, 'test2.rive'), {});
        const adapter = new builder.TestAdapter();
        const bot = new builder.Bot(adapter)
            .use(new builder.MemoryStorage())
            .use(new builder.BotStateManager())
            .onReceive((context) => {
                return rs1.receiveActivity(context, () => {
                    return !context.responded ? rs2.receiveActivity(context, () => Promise.resolve()) : Promise.resolve(); 
                });
            });
        adapter
            .send('hello bot').assertReply('Hello human!')
            .send('howdy bot').assertReplyOneOf(['yo!', 'how do human!', 'hello human!'])
            .then(() => done());
    });
})
