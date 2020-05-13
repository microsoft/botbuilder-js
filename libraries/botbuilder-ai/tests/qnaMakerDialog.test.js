const { QnAMakerDialog, QnAMaker } = require('../lib');
const { DialogSet } = require('botbuilder-dialogs');
const { ok, strictEqual } = require('assert');

const KB_ID = 'kbId';
const ENDPOINT_KEY = 'endpointKey';

describe('QnAMakerDialog', function() {
    this.timeout(3000);

    it('should successfully construct', () => {
        new QnAMakerDialog('kbId', 'endpointKey', 'https://myqnainstance.azurewebsites.net/qnamaker');
    });

    it('should add instance to a dialog set', () => {
        const dialogs = new DialogSet();
        const qna = new QnAMakerDialog('kbId', 'endpointKey', 'https://myqnainstance.azurewebsites.net/qnamaker');

        dialogs.add(qna);
    });

    describe('getQnAClient()', () => {
        it('should return unmodified v5 hostName value', async () => {
            const V5_HOSTNAME = 'https://qnamaker-acom.azure.com/qnamaker/v5.0';
    
            // Create QnAMakerDialog
            const qna = new QnAMakerDialog(KB_ID, ENDPOINT_KEY, V5_HOSTNAME);
            const client = await qna.getQnAClient({state: {}});
    
            ok(client instanceof QnAMaker);
            strictEqual(client.endpoint.knowledgeBaseId,  KB_ID);
            strictEqual(client.endpoint.endpointKey, ENDPOINT_KEY);
            strictEqual(client.endpoint.host, V5_HOSTNAME);
        });
    
        it('should construct v4 API endpoint', async () => {
            const INCOMPLETE_HOSTNAME = 'myqnainstance';
            const HOSTNAME = 'https://myqnainstance.azurewebsites.net/qnamaker';
    
            // Create QnAMakerDialog with incomplete hostname
            const qnaDialog = new QnAMakerDialog(KB_ID, ENDPOINT_KEY, INCOMPLETE_HOSTNAME);
            const fixedClient = await qnaDialog.getQnAClient({state: {}});
    
            ok(fixedClient instanceof QnAMaker);
            strictEqual(fixedClient.endpoint.knowledgeBaseId, KB_ID);
            strictEqual(fixedClient.endpoint.endpointKey, ENDPOINT_KEY);
            strictEqual(fixedClient.endpoint.host, HOSTNAME);
        });
    
        it('should construct BAD v4 hostnames', async () => {
            const createHostName = (hostName) => `https://${ hostName }.azurewebsites.net/qnamaker`;
            const NOT_V5_HOSTNAME = 'myqnainstance.net/qnamaker';
    
            // Missing authority
            const noAuthority = new QnAMakerDialog(KB_ID, ENDPOINT_KEY, NOT_V5_HOSTNAME);
            const noAuthorityClient = await noAuthority.getQnAClient({state: {}});
    
            ok(noAuthorityClient instanceof QnAMaker);
            strictEqual(noAuthorityClient.endpoint.knowledgeBaseId,  KB_ID);
            strictEqual(noAuthorityClient.endpoint.endpointKey, ENDPOINT_KEY);
            strictEqual(noAuthorityClient.endpoint.host, createHostName(NOT_V5_HOSTNAME));
        });
    });
});
