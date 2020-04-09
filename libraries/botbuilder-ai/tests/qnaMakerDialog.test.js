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
        const NOT_HTTPS = 'http://myqnainstance.azurewebsites.net/qnamaker';
        const INCOMPLETE_HOSTNAME = 'myqnainstance';

        // Create QnAMakerDialog
        const qna = new QnAMakerDialog(KB_ID, ENDPOINT_KEY, HOSTNAME);
        const client = qna.getQnAClient();

        ok(client instanceof QnAMaker);
        strictEqual(client.endpoint.knowledgeBaseId,  KB_ID);
        strictEqual(client.endpoint.endpointKey, ENDPOINT_KEY);
        strictEqual(client.endpoint.host, HOSTNAME);

        // Create QnAMakerDialog with http hostName
        const qnaHttp = new QnAMakerDialog(KB_ID, ENDPOINT_KEY, NOT_HTTPS);
        const httpClient = qnaHttp.getQnAClient();

        ok(httpClient instanceof QnAMaker);
        strictEqual(httpClient.endpoint.knowledgeBaseId,  KB_ID);
        strictEqual(httpClient.endpoint.endpointKey, ENDPOINT_KEY);
        strictEqual(httpClient.endpoint.host, NOT_HTTPS);

        // Create QnAMakerDialog with incomplete hostname
        const qnaDialog = new QnAMakerDialog(KB_ID, ENDPOINT_KEY, INCOMPLETE_HOSTNAME);
        const fixedClient = qnaDialog.getQnAClient();

        ok(fixedClient instanceof QnAMaker);
        strictEqual(fixedClient.endpoint.knowledgeBaseId, KB_ID);
        strictEqual(fixedClient.endpoint.endpointKey, ENDPOINT_KEY);
        strictEqual(fixedClient.endpoint.host, HOSTNAME);
    });

    it('should construct BAD hostnames', () => {
        const KB_ID = 'kbId';
        const ENDPOINT_KEY = 'endpointKey';
        const createHostName = (hostName) => `https://${ hostName }.azurewebsites.net/qnamaker`;

        const NO_AUTHORITY = 'myqnainstance.net/qnamaker';
        const NO_TLD = 'https://myqnainstance/qnamaker';
        const NO_QNAMAKER = 'https://myqnainstance.net/';
        const ADDITIONAL_PATH = 'https://myqnainstance.net/my/path/qnamaker';

        // Missing authority
        const noAuthority = new QnAMakerDialog(KB_ID, ENDPOINT_KEY, NO_AUTHORITY);
        const noAuthorityClient = noAuthority.getQnAClient();

        ok(noAuthorityClient instanceof QnAMaker);
        strictEqual(noAuthorityClient.endpoint.knowledgeBaseId,  KB_ID);
        strictEqual(noAuthorityClient.endpoint.endpointKey, ENDPOINT_KEY);
        strictEqual(noAuthorityClient.endpoint.host, createHostName(NO_AUTHORITY));

        // Missing TLD
        const noTLD = new QnAMakerDialog(KB_ID, ENDPOINT_KEY, NO_TLD);
        const noTLDClient = noTLD.getQnAClient();

        ok(noTLDClient instanceof QnAMaker);
        strictEqual(noTLDClient.endpoint.knowledgeBaseId,  KB_ID);
        strictEqual(noTLDClient.endpoint.endpointKey, ENDPOINT_KEY);
        strictEqual(noTLDClient.endpoint.host, createHostName(NO_TLD));

        // Missing path
        const noPath = new QnAMakerDialog(KB_ID, ENDPOINT_KEY, NO_QNAMAKER);
        const noPathClient = noPath.getQnAClient();

        ok(noPathClient instanceof QnAMaker);
        strictEqual(noPathClient.endpoint.knowledgeBaseId,  KB_ID);
        strictEqual(noPathClient.endpoint.endpointKey, ENDPOINT_KEY);
        strictEqual(noPathClient.endpoint.host, createHostName(NO_QNAMAKER));

        // Additional path
        const additionalPath = new QnAMakerDialog(KB_ID, ENDPOINT_KEY, ADDITIONAL_PATH);
        const extraPathClient = additionalPath.getQnAClient();

        ok(extraPathClient instanceof QnAMaker);
        strictEqual(extraPathClient.endpoint.knowledgeBaseId,  KB_ID);
        strictEqual(extraPathClient.endpoint.endpointKey, ENDPOINT_KEY);
        strictEqual(extraPathClient.endpoint.host, createHostName(ADDITIONAL_PATH));
    });
});
