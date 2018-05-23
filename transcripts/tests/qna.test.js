const assert = require('assert');
const { QnAMaker } = require('botbuilder-ai');
const { testBotWithTranscript } = require('../helpers');

var qnaKnowledgeBaseId = process.env['QNAKNOWLEDGEBASEID'];
var qnaEndpointKey = process.env['QNAENDPOINTKEY'];
var qnaHostname = process.env['QNAHOSTNAME'];
var qna;

describe(`LUIS Tests using transcripts`, function () {
    if (!qnaKnowledgeBaseId || !qnaEndpointKey) {
        console.warn('* Missing QnAMaker Environment variables (QNAKNOWLEDGEBASEID, QNAENDPOINTKEY) - Skipping QnAMaker Tests');
        return;
    }

    qna = new QnAMaker({
        knowledgeBaseId: qnaKnowledgeBaseId,
        endpointKey: qnaEndpointKey,
        host: qnaHostname
    }, { answerBeforeNext: true });

    this.timeout(15000)

    it('QnAMaker Middleware', testBotWithTranscript('QnATests/QnAMiddleware.chat', QnATestLogic, (adapter) => adapter.use(qna)));
});

function QnATestLogic(conversationState, userState) {
    return async (context) => {
        if (!context.responded) {
            await context.sendActivity("default message");
        }
    }
}