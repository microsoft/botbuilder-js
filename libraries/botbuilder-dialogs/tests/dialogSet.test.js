const { ConversationState, MemoryStorage, TestAdapter } = require('botbuilder-core');
const { Dialog, DialogSet, WaterfallDialog, DialogTurnStatus } = require('../');
const assert = require('assert');

const beginMessage = { text: `begin`, type: 'message' };
const continueMessage = { text: `continue`, type: 'message' };

describe('DialogSet', function () {
    this.timeout(5000);

    it('should throw on createContext(null)', async function () {
        const convoState = new ConversationState(new MemoryStorage());
        const dialogSet = new DialogSet(convoState.createProperty('dialogState'));
        try {
            await dialogSet.createContext(null);
            assert.fail('should have thrown error on null');
        } catch (err) {
        }
    });

    it('should add a waterfall to the dialog set.', function (done) {
        // Create new ConversationState with MemoryStorage and instantiate DialogSet with PropertyAccessor.
        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new WaterfallDialog('a', [
            function (step) {
                assert(step);
            }
        ]));
        done();
    });

    it('should add add fluent dialogs to the dialog set.', function (done) {
        // Create new ConversationState with MemoryStorage and instantiate DialogSet with PropertyAccessor.
        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs
            .add(new WaterfallDialog('A', [
                function (dc) {
                    assert(dc);
                }
            ]))
            .add(new WaterfallDialog('B', [
                function (dc) {
                    assert(dc);
                }
            ]));
        assert(dialogs.find('A'), `dialog A not found.`);
        assert(dialogs.find('B'), `dialog B not found.`);

        done();
    });


    it('should throw an exception when trying to add the same dialog twice.', function (done) {
        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new WaterfallDialog('a', [
            function (step) { }
        ]));

        try {
            dialogs.add('a', [
                function (step) { }
            ]);
        } catch (err) {
            return done();
        }
        throw new Error('Should have thrown an error on adding dialogs with same ID.');
    });

    it('should find() a dialog that was added.', function (done) {
        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new WaterfallDialog('a', [
            function (step) { }
        ]));

        assert(dialogs.find('a'), `dialog not found.`);
        assert(!dialogs.find('b'), `dialog found that shouldn't exist.`);
        done();
    });

    it('should save dialog stack state between turns.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.beginDialog('a');
            }
            await convoState.saveChanges(turnContext);
        });

        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new WaterfallDialog('a', [
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

        adapter.send(beginMessage)
            .assertReply('Greetings')
            .send(continueMessage)
            .assertReply('Good bye!')
            .then(() => done());
    });
});
