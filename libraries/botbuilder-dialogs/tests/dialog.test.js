const { TestAdapter, TurnContext, BotStatePropertyAccessor, BotState, MemoryStorage } = require('botbuilder');
const { DialogSet, Dialog, DialogState } =  require('../');
const assert = require('assert');

const beginMessage = { text: `begin`, type: 'message' };

class TestContext extends TurnContext {
    constructor(request) {
        super(new TestAdapter(), request);
        this.sent = undefined;
        this.onSendActivities((context, activities, next) => {
            this.sent = activities;
            context.responded = true;
        });
    }
}

class TestDialog extends Dialog {
    constructor(dialogId) {
        super(dialogId);
        this.beginCalled = false;
        this.beginArgs = undefined;
        this.continueCalled = false;
    }

    dialogBegin(dc, args) {
        this.beginCalled = true;
        this.beginArgs = args;
        return Dialog.EndOfTurn;
    }

    dialogContinue(dc) {
        this.continueCalled = true;
        return { hasActive: false, hasResult: true, result: 120 };
    }
}

describe('Dialog', function() {
    this.timeout(5000);

    it('should call dialog from a dialog set.', async function () {
        const dialog = new TestDialog('dialog');

        const state = new BotStatePropertyAccessor(new BotState(new MemoryStorage(), c => 'test'));
        const dialogs = new DialogSet(state);
        dialogs.add(dialog);

        const context = new TestContext(beginMessage);
        const dc = await dialogs.createContext(context);
        await dc.begin('dialog', { foo: 'bar' })
        assert(dialog.beginCalled);
        assert(dialog.beginArgs && dialog.beginArgs.foo === 'bar');
    });

    it('should call dialog using begin().', async function () {
        const dialog = new TestDialog('dialog');

        const context = new TestContext(beginMessage);
        let completion = await dialog.dialogBegin(context, { foo: 'bar' });

        assert(completion && completion.hasActive);
        assert(dialog.beginCalled);
        assert(dialog.beginArgs && dialog.beginArgs.foo === 'bar');
    });

    it('should continue() a multi-turn dialog.', async function () {
        const dialog = new TestDialog();

        const context = new TestContext(beginMessage);
        let completion = await dialog.dialogBegin(context, { foo: 'bar' });
        assert(completion && completion.hasActive);

        completion = await dialog.dialogContinue(context);
        assert(dialog.continueCalled);
        assert(completion && !completion.hasActive && completion.hasResult);
        assert(completion.result === 120);
    });
});
