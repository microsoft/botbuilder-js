const assert = require('assert');
const { QnAMaker } = require('botbuilder-ai');
const assertBotLogicWithTranscript = require('../../libraries/botbuilder-core/tests/transcriptUtilities').assertBotLogicWithBotBuilderTranscript;

var qnaKnowledgeBaseId = process.env['QNAKNOWLEDGEBASEID_TRANSCRIPT'];
var qnaEndpointKey = process.env['QNAENDPOINTKEY_TRANSCRIPT'];
var qnaHostname = process.env['QNAHOSTNAME_TRANSCRIPT'];
var qna;

describe(`LUIS Tests using transcripts`, function () {
    if (!qnaKnowledgeBaseId || !qnaEndpointKey) {
        console.warn('* Missing QnAMaker Environment variables (QNAKNOWLEDGEBASEID_TRANSCRIPT, QNAENDPOINTKEY_TRANSCRIPT) - Skipping QnAMaker Tests');
        return;
    }

    qna = new QnAMaker({
        knowledgeBaseId: qnaKnowledgeBaseId,
        endpointKey: qnaEndpointKey,
        host: qnaHostname
    }, { answerBeforeNext: true });

    this.timeout(20000);

    it('QnAMaker Middleware', assertBotLogicWithTranscript('QnATests/QnAMiddleware.chat', QnATestLogic, (adapter) => adapter.use(qna)));
});

function QnATestLogic(conversationState, userState) {
    return async (context) => {
        if (!context.responded) {
            await context.sendActivity("default message");
        }
    }
}