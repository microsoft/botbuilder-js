const { TestAdapter, MemoryStorage, ConversationState } = require('botbuilder');
const { DialogSet } =  require('../');
const assert = require('assert');

const beginMessage = { text: `begin`, type: 'message' };
const continueMessage = { text: `continue`, type: 'message' };

function createBot(botLogic) {
    const storage = new MemoryStorage();
    const adapter = new TestAdapter(botLogic)
        .use(new ConversationState(storage));
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
                return ctx.sendActivities(beginMessage);
            },
            continue: (ctx, dlgs) => {
                assert(ctx, 'Missing context in continue()');
                assert(dlgs === dialogs, 'Dialogs not passed to continue()');
                return ctx.sendActivities(continueMessage);
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
