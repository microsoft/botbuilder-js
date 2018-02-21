const { Bot, BotStateManager, MemoryStorage, TestAdapter } = require('botbuilder');
const { DialogSet } =  require('../');
const assert = require('assert');

function createBot(receiver) {
    const adapter = new TestAdapter();
    const bot = new Bot(adapter)
        .use(new MemoryStorage())
        .use(new BotStateManager())
        .onReceive(receiver);
    return adapter;
}

describe('DialogSet class', function() {
    this.timeout(5000);

    it('should call Dialog.begin() and Dialog.continue().', function (done) {
        const dialogs = new DialogSet();
        dialogs.add('a', {
            begin: (ctx, dlgs, args) => {
                assert(ctx, 'Missing context in begin()');
                assert(dlgs === dialogs, 'Dialogs not passed to begin()');
                assert(args === 'z', 'Args not passed');
                ctx.reply(`begin`);
            },
            continue: (ctx, dlgs) => {
                assert(ctx, 'Missing context in continue()');
                assert(dlgs === dialogs, 'Dialogs not passed to continue()');
                ctx.reply(`continue`);
            }
        });

        createBot((ctx) => {
            return dialogs.continue(ctx).then(() => {
                if (!ctx.responded) {
                    return dialogs.begin(ctx, 'a', 'z');
                }
            })
        })
        .test(`test`, `begin`)
        .test(`test`, `continue`)
        .then(() => done());
    });
});
