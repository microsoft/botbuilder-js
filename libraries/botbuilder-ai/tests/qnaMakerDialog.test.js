const { QnAMakerDialog, QnAMaker } = require('../lib');
const { DialogSet } = require('botbuilder-dialogs');
const { ok, strictEqual } = require('assert');

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

    it('getQnAClient() should construct https hostname', () => {
        const KB_ID = 'kbId';
        const ENDPOINT_KEY = 'endpointKey';
        const HOSTNAME = 'https://myqnainstance.azurewebsites.net/qnamaker';
        const INCOMPLETE_HOSTNAME = 'myqnainstance';

        // Create QnAMakerDialog
        const qna = new QnAMakerDialog(KB_ID, ENDPOINT_KEY, HOSTNAME);
        const client = qna.getQnAClient();

        ok(client instanceof QnAMaker);
        strictEqual(client.endpoint.knowledgeBaseId,  KB_ID);
        strictEqual(client.endpoint.endpointKey, ENDPOINT_KEY);
        strictEqual(client.endpoint.host, HOSTNAME);

        // Create QnAMakerDialog with incomplete hostname
        const qnaDialog = new QnAMakerDialog(KB_ID, ENDPOINT_KEY, INCOMPLETE_HOSTNAME);
        const fixedClient = qnaDialog.getQnAClient();

        ok(fixedClient instanceof QnAMaker);
        strictEqual(fixedClient.endpoint.knowledgeBaseId, KB_ID);
        strictEqual(fixedClient.endpoint.endpointKey, ENDPOINT_KEY);
        strictEqual(fixedClient.endpoint.host, HOSTNAME);
    });
});
