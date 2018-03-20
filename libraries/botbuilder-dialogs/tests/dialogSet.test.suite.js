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
        const stack = [];
        const dialogs = new DialogSet();
        dialogs.add('a', {
            begin: (dc, args) => {
                assert(dc, 'Missing dialog context in begin()');
                assert(args === 'z', 'Args not passed');
                return dc.context.sendActivity(beginMessage);
            },
            continue: (dc) => {
                assert(dc, 'Missing dialog context in continue()');
                return dc.context.sendActivity(continueMessage);
            }
        });

        createBot((context) => {
            const dc = dialogs.createContext(context, stack);
            return dc.continue().then(() => {
                if (!context.responded) {
                    return dc.begin('a', 'z');
                }
            })
        })
        .test(`test`, `begin`)
        .test(`test`, `continue`)
        .then(() => done());
    });
});
