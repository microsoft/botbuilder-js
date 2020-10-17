const { QnAMakerDialog, QnAMaker } = require('../lib');
const { Dialog, DialogSet, DialogTurnStatus } = require('botbuilder-dialogs');
const { ok, strictEqual } = require('assert');
const { ConversationState, MemoryStorage, TestAdapter } = require('botbuilder-core');
const { assert } = require('console');

const KB_ID = 'kbId';
const ENDPOINT_KEY = 'endpointKey';
const beginMessage = { text: `begin`, type: 'message' };

class QnADialogTestBot extends TestAdapter {
    /**
     * Creates a new class QnADialogTestBot instance.
     * @param logicOrConversation The bots logic that's under test.
     * @param template (Optional) activity containing default values to assign to all test messages received.
     */
    constructor(logicOrConversation, template, sendTraceActivity = false) {
        super(logicOrConversation, template, sendTraceActivity);
    }
}

class QnaTestDialog extends QnAMakerDialog {
    constructor(knowledgeBaseId, endpointKey, hostName, additionalQnaDialogParams = []) {
        super(knowledgeBaseId, endpointKey, hostName, ...additionalQnaDialogParams);

        // this.addStep(this.firstStep.bind(this));
        // this.addStep(this.secondStep.bind(this));
        this.value = 1;
    }

    // async firstStep(step) {
    //     assert(step, 'hey!');
    //     assert.equal(this.value, 1, 'this pointer is bogus in firstStep');
    //     await step.context.sendActivity('bot responding.');
    //     return Dialog.EndOfTurn;
    // }

    // async secondStep(step) {
    //     assert(step);
    //     assert.equal(this.value, 1, 'this pointer is bogus in secondStep');
    //     return await step.endDialog('ending WaterfallDialog.');
    // }
}

describe('QnAMakerDialog', function() {
    this.timeout(3000);

    it('should successfully construct', () => {
        new QnAMakerDialog('kbId', 'endpointKey', 'https://myqnainstance.azurewebsites.net/qnamaker');
    });

    it('should fail to construct with missing params', () => {
        try {
            new QnAMakerDialog(undefined, 'endpointKey', 'https://myqnainstance.azurewebsites.net/qnamaker');
        } catch (e) {
            strictEqual(e.message, 'QnAMakerDialog: missing knowledgeBaseId parameter');
        }

        try {
            new QnAMakerDialog('kbId', undefined, 'https://myqnainstance.azurewebsites.net/qnamaker');
        } catch (e) {
            strictEqual(e.message, 'QnAMakerDialog: missing endpointKey parameter');
        }

        try {
            new QnAMakerDialog('kbId', 'endpointKey', undefined);
        } catch (e) {
            strictEqual(e.message, 'QnAMakerDialog: missing hostName parameter');
        }
    });

    it('should add instance to a dialog set', () => {
        const dialogs = new DialogSet();
        const qna = new QnAMakerDialog('kbId', 'endpointKey', 'https://myqnainstance.azurewebsites.net/qnamaker');

        dialogs.add(qna);
    });

    describe('getQnAClient()', () => {
        it('should return unmodified v5 hostName value', async () => {
            // Add QnAMakerDialog
            const V5_HOSTNAME = 'https://qnamaker-acom.azure.com/qnamaker/v5.0';
            
            const convoState = new ConversationState(new MemoryStorage());
            const dialogState = convoState.createProperty('dialogState');
            const dialogs = new DialogSet(dialogState);
            dialogs.add(new QnaTestDialog(KB_ID, ENDPOINT_KEY, V5_HOSTNAME));
            const qnaDialog = dialogs.find('QnAMakerDialog');

            // QnAMakerDialog automatically adds at least 4 steps
            // Add custom assertion step to beginning of waterfall dialog
            qnaDialog.steps.unshift(async (step) => {
                assert(step);
                const qnaClient = qnaDialog.getQnAClient(step);

                ok(qnaClient instanceof QnAMaker);
                strictEqual(qnaClient.endpoint.knowledgeBaseId,  KB_ID);
                strictEqual(qnaClient.endpoint.endpointKey, ENDPOINT_KEY);
                strictEqual(qnaClient.endpoint.host, V5_HOSTNAME);
                
                return Dialog.EndOfTurn;
            });

            const adapter = new QnADialogTestBot(async (turnContext) => {
                const dc = await dialogs.createContext(turnContext);
                const results = await dc.continueDialog();

                if (results.status === DialogTurnStatus.empty) {
                    await dc.beginDialog('QnAMakerDialog');
                }
                
                await convoState.saveChanges(turnContext);
            });

            await adapter.send(beginMessage);
        });

        it('should construct v4 API endpoint', async () => {
            // Add QnAMakerDialog
            const INCOMPLETE_HOSTNAME = 'myqnainstance';
            const HOSTNAME = 'https://myqnainstance.azurewebsites.net/qnamaker';
            
            const convoState = new ConversationState(new MemoryStorage());
            const dialogState = convoState.createProperty('dialogState');
            const dialogs = new DialogSet(dialogState);
            dialogs.add(new QnaTestDialog(KB_ID, ENDPOINT_KEY, INCOMPLETE_HOSTNAME));

            const adapter = new QnADialogTestBot(async (turnContext) => {
                const dc = await dialogs.createContext(turnContext);
                const results = await dc.continueDialog();

                if (results.status === DialogTurnStatus.empty) {
                    await dc.beginDialog('QnAMakerDialog');
                }
                
                await convoState.saveChanges(turnContext);
            });
            
            // Add custom assertion step as the first of QnAMakerDialog steps
            const qnaDialog = dialogs.find('QnAMakerDialog');
            qnaDialog.steps.unshift(async (step) => {
                assert(step);
                const fixedClient = qnaDialog.getQnAClient(step);

                ok(fixedClient instanceof QnAMaker);
                strictEqual(fixedClient.endpoint.knowledgeBaseId, KB_ID);
                strictEqual(fixedClient.endpoint.endpointKey, ENDPOINT_KEY);
                strictEqual(fixedClient.endpoint.host, HOSTNAME);
                
                return Dialog.EndOfTurn;
            });

            // Begin dialog
            await adapter.send(beginMessage);
        });

        it('should construct v4 API endpoint', async () => {
            // Add QnAMakerDialog
            const INCOMPLETE_HOSTNAME = 'myqnainstance';
            const HOSTNAME = 'https://myqnainstance.azurewebsites.net/qnamaker';
            
            const convoState = new ConversationState(new MemoryStorage());
            const dialogState = convoState.createProperty('dialogState');
            const dialogs = new DialogSet(dialogState);
            dialogs.add(new QnaTestDialog(KB_ID, ENDPOINT_KEY, INCOMPLETE_HOSTNAME));

            const adapter = new QnADialogTestBot(async (turnContext) => {
                const dc = await dialogs.createContext(turnContext);
                const results = await dc.continueDialog();

                if (results.status === DialogTurnStatus.empty) {
                    await dc.beginDialog('QnAMakerDialog');
                }
                
                await convoState.saveChanges(turnContext);
            });
            
            // Add custom assertion step as the first of QnAMakerDialog steps
            const qnaDialog = dialogs.find('QnAMakerDialog');
            qnaDialog.steps.unshift(async (step) => {
                assert(step);
                const fixedClient = qnaDialog.getQnAClient(step);

                ok(fixedClient instanceof QnAMaker);
                strictEqual(fixedClient.endpoint.knowledgeBaseId, KB_ID);
                strictEqual(fixedClient.endpoint.endpointKey, ENDPOINT_KEY);
                strictEqual(fixedClient.endpoint.host, HOSTNAME);
                
                return Dialog.EndOfTurn;
            });

            // Begin dialog
            await adapter.send(beginMessage);
        });

        it('should construct v4 API endpoint', async () => {
            // Add QnAMakerDialog
            const createHostName = (hostName) => `https://${ hostName }.azurewebsites.net/qnamaker`;
            const NOT_V5_HOSTNAME = 'myqnainstance.net/qnamaker';
            
            const convoState = new ConversationState(new MemoryStorage());
            const dialogState = convoState.createProperty('dialogState');
            const dialogs = new DialogSet(dialogState);
            // Missing authority
            dialogs.add(new QnaTestDialog(KB_ID, ENDPOINT_KEY, NOT_V5_HOSTNAME));

            const adapter = new QnADialogTestBot(async (turnContext) => {
                const dc = await dialogs.createContext(turnContext);
                const results = await dc.continueDialog();

                if (results.status === DialogTurnStatus.empty) {
                    await dc.beginDialog('QnAMakerDialog');
                }
                
                await convoState.saveChanges(turnContext);
            });
            
            // Add custom assertion step as the first step of QnAMakerDialog steps
            const qnaDialog = dialogs.find('QnAMakerDialog');
            qnaDialog.steps.unshift(async (step) => {
                assert(step);
                const noAuthorityClient = qnaDialog.getQnAClient(step);

                ok(noAuthorityClient instanceof QnAMaker);
                strictEqual(noAuthorityClient.endpoint.knowledgeBaseId,  KB_ID);
                strictEqual(noAuthorityClient.endpoint.endpointKey, ENDPOINT_KEY);
                strictEqual(noAuthorityClient.endpoint.host, createHostName(NOT_V5_HOSTNAME));
                
                return Dialog.EndOfTurn;
            });

            // Begin dialog
            await adapter.send(beginMessage);
        });
    
    });
});
