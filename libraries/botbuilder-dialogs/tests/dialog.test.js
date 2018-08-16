const { TestAdapter, TurnContext } = require('botbuilder-core');
const { DialogSet, Dialog } =  require('../');
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
    constructor(options) {
        super(options);
        this.beginCalled = false;
        this.beginArgs = undefined;
        this.continueCalled = false;
    }

    dialogBegin(dc, args) {
        this.beginCalled = true;
        this.beginArgs = args;
        return dc.context.sendActivity(`begin called`);
    }

    dialogContinue(dc) {
        this.continueCalled = true;
        return dc.end(120);
    }
}

describe.skip('Dialog', function() {
    this.timeout(5000);

    it('should call dialog from a dialog set.', async function () {
        const dialog = new TestDialog();

        const dialogs = new DialogSet();
        dialogs.add('dialog', dialog);

        const state = {};
        const context = new TestContext(beginMessage);
        const dc = await dialogs.createContext(context, state);
        await dc.begin('dialog', { foo: 'bar' })
        assert(dialog.beginCalled);
        assert(dialog.beginArgs && dialog.beginArgs.foo === 'bar');
    });

    it('should call dialog using begin().', async function () {
        const dialog = new TestDialog();

        const state = {};
        const context = new TestContext(beginMessage);
        let completion = await dialog.begin(context, state, { foo: 'bar' });

        assert(completion && completion.isActive);
        assert(dialog.beginCalled);
        assert(dialog.beginArgs && dialog.beginArgs.foo === 'bar');
    });

    it('should continue() a multi-turn dialog.', async function () {
        const dialog = new TestDialog();

        const state = {};
        const context = new TestContext(beginMessage);
        let completion = await dialog.begin(context, state, { foo: 'bar' });
        assert(completion && completion.isActive);

        completion = await dialog.continue(context, state);
        assert(dialog.continueCalled);
        assert(completion && !completion.isActive && completion.isCompleted);
        assert(completion.result === 120);
    });
});
