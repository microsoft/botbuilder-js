const { ConversationState, MemoryStorage, TestAdapter } = require('botbuilder-core');
const { DateTimePrompt, DialogSet, DialogTurnStatus } =  require('../');
const assert = require('assert');

const answerMessage = { text: `January 1st, 2018 at 9am`, type: 'message' };
const answerMessage2 = { text: `September 2nd, 2012`, type: 'message'};
const invalidMessage = { text: `I am not sure`, type: 'message' };

describe('DatetimePrompt', function() {
    this.timeout(5000);

    it('should call DateTimePrompt using dc.prompt().', function (done) {
        // Initialize TestAdapter.
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continue();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', 'Please say something.');
            } else if (results.status === DialogTurnStatus.complete) {
                const dates = results.result;
                await turnContext.sendActivity(dates[0].timex);
            }
        });
        // Create new ConversationState with MemoryStorage and register the state as middleware.
        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);

        // Create a DialogState property, DialogSet and DateTimePrompt.
        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new DateTimePrompt('prompt'));

        adapter.send('Hello')
        .assertReply('Please say something.')
        .send(answerMessage)
        .assertReply('2018-01-01T09');
        done();
    });

    it('should send a prompt if the prompt is passed in via PromptOptions.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continue();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { prompt: 'Please say something.' });
            } else if (results.status === DialogTurnStatus.complete) {
                const dates = results.result;
                await turnContext.sendActivity(dates[0].timex);
            }
        });
        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new DateTimePrompt('prompt'));

        adapter.send('Hello')
        .assertReply('Please say something.')
        .send(answerMessage)
        .assertReply('2018-01-01T09');
        done();
    });
    
    it('should call DateTimePrompt with custom validator.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continue();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', 'Please say something.');
            } else if (results.status === DialogTurnStatus.complete) {
                const dates = results.result;
                await turnContext.sendActivity(dates[0].timex);
            }
        });
        
        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new DateTimePrompt('prompt', async (context, prompt) => {
            assert(context);
            assert(prompt);
            prompt.end(prompt.recognized.value);
        }));

        adapter.send('Hello')
        .assertReply('Please say something.')
        .send(answerMessage)
        .assertReply('2018-01-01T09');
        done();
    });

    it('should send custom retryPrompt.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continue();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { prompt: 'Please say something.', retryPrompt: 'Please provide a valid datetime.' });
            } else if (results.status === DialogTurnStatus.complete) {
                const dates = results.result;
                await turnContext.sendActivity(dates[0].timex);
            }
        });
        
        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new DateTimePrompt('prompt', async (context, prompt) => {
            assert(context);
            assert(prompt);
            if (prompt.recognized.succeeded) {
                prompt.end(prompt.recognized.value);
            }
        }));

        adapter.send('Hello')
        .assertReply('Please say something.')
        .send(invalidMessage)
        .assertReply('Please provide a valid datetime.')
        .send(answerMessage2)
        .assertReply('2012-09-02');
        done();
    });

    it('should send ignore retryPrompt if validator replies.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continue();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { prompt: 'Please say something.', retryPrompt: 'Please provide a valid datetime.' });
            } else if (results.status === DialogTurnStatus.complete) {
                const dates = results.result;
                await turnContext.sendActivity(dates[0].timex);
            }
        });
        
        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new DateTimePrompt('prompt', async (context, prompt) => {
            assert(context);
            assert(prompt);
            if (prompt.recognized.succeeded) {
                prompt.end(prompt.recognized.value);
            } else {
                await context.sendActivity('That was a bad date.');
            }
        }));

        adapter.send('Hello')
        .assertReply('Please say something.')
        .send(invalidMessage)
        .assertReply('That was a bad date.')
        .send(answerMessage2)
        .assertReply('2012-09-02');
        done();
    });

    it('should not send any retryPrompt no prompt specified.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continue();
            if (results.status === DialogTurnStatus.empty) {
                await dc.begin('prompt');
            } else if (results.status === DialogTurnStatus.complete) {
                const dates = results.result;
                await turnContext.sendActivity(dates[0].timex);
            }
        });
        
        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new DateTimePrompt('prompt', async (context, prompt) => {
            assert(context);
            assert(prompt);
            if (prompt.recognized.succeeded) {
                prompt.end(prompt.recognized.value);
            }
        }));

        adapter.send('Hello')
        .send(invalidMessage)
        .send(answerMessage2)
        .assertReply('2012-09-02');
        done();
    });
});
