const { ConversationState, MemoryStorage, TestAdapter } = require('botbuilder-core');
const { Dialog, MainDialog, WaterfallDialog, DialogTurnStatus } = require('../lib');
const assert = require('assert');

const beginMessage = { text: `begin`, type: 'message' };
const continueMessage = { text: `continue`, type: 'message' };

describe('MainDialog', function () {
    this.timeout(5000);

    it('should throw on null property accessor', function (done) {
        try {
            new MainDialog(null);
            assert.fail('should have thrown error on null');
        } catch (err) {
        }
        done();
    });

    it('should throw on createContext(null)', async function () {
        const convoState = new ConversationState(new MemoryStorage());
        const mainDialog = new MainDialog(convoState.createProperty('mainDialog'));
        try {
            await mainDialog.run(null);
            assert.fail('should have thrown error on null turn context');
        } catch (err) {
        }
    });

    it('should add a waterfall to the dialog set.', function (done) {
        // Create new ConversationState with MemoryStorage and instantiate MainDialog with PropertyAccessor.
        const convoState = new ConversationState(new MemoryStorage());
        const mainDialog = new MainDialog(convoState.createProperty('maindialog'));
        mainDialog.addDialog(new WaterfallDialog('a', [
            function (step) {
                assert(step);
            }
        ]));
        done();
    });

    it('should add add fluent mainDialog to the dialog set.', function (done) {
        // Create new ConversationState with MemoryStorage and instantiate MainDialog with PropertyAccessor.
        const convoState = new ConversationState(new MemoryStorage());
        const mainDialog = new MainDialog(convoState.createProperty('maindialog'));
        mainDialog
            .addDialog(new WaterfallDialog('A', [
                function (dc) {
                    assert(dc);
                }
            ]))
            .addDialog(new WaterfallDialog('B', [
                function (dc) {
                    assert(dc);
                }
            ]));
        assert(mainDialog.findDialog('A'), `dialog A not found.`);
        assert(mainDialog.findDialog('B'), `dialog B not found.`);

        done();
    });


    it('should throw an exception when trying to add the same dialog twice.', function (done) {
        const convoState = new ConversationState(new MemoryStorage());
        const mainDialog = new MainDialog(convoState.createProperty('maindialog'));
        mainDialog.addDialog(new WaterfallDialog('a', [
            function (step) { }
        ]));

        try {
            mainDialog.addDialog('a', [
                function (step) { }
            ]);
        } catch (err) {
            return done();
        }
        throw new Error('Should have thrown an error on adding mainDialog with same ID.');
    });

    it('should find a dialog that was added.', function (done) {
        const convoState = new ConversationState(new MemoryStorage());
        const mainDialog = new MainDialog(convoState.createProperty('maindialog'));
        mainDialog.addDialog(new WaterfallDialog('a', [
            function (step) { }
        ]));

        assert(mainDialog.findDialog('a'), `dialog not found.`);
        assert(!mainDialog.findDialog('b'), `dialog found that shouldn't exist.`);
        done();
    });

    it('should save dialog stack state between turns.', function (done) {

        const convoState = new ConversationState(new MemoryStorage());
        const mainDialog = new MainDialog(convoState.createProperty('mainDialog'));
        mainDialog.addDialog(new WaterfallDialog('a', [
            async function (step) {
                assert(step);
                await step.context.sendActivity(`Greetings`);
                return Dialog.EndOfTurn;
            },
            async function (step) {
                await step.context.sendActivity('Good bye!');
                return await step.endDialog();
            }
        ]));
        const adapter = new TestAdapter(async (turnContext) => {
            await mainDialog.run(turnContext);
            await convoState.saveChanges(turnContext);
        });

        adapter.send(beginMessage)
            .assertReply('Greetings')
            .send(continueMessage)
            .assertReply('Good bye!')
            .then(() => done());
    });
});
