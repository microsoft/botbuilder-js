const assert = require('assert');
const { LuisRecognizer } = require('botbuilder-ai');
const assertBotLogicWithTranscript = require('../../libraries/botbuilder-core/tests/transcriptUtilities').assertBotLogicWithBotBuilderTranscript;

var luisAppId = process.env['LUISAPPID_TRANSCRIPT'];
var luisSubscriptionKey = process.env['LUISAPPKEY_TRANSCRIPT'];
var luisUriBase = process.env['LUISURIBASE_TRANSCRIPT'];
var recognizer;

xdescribe(`LUIS Tests using transcripts`, function () {
    if (!luisAppId || !luisSubscriptionKey) {
        console.warn('* Missing LUIS Environment variables (LUISAPPID_TRANSCRIPT, LUISAPPKEY_TRANSCRIPT) - Skipping LUIS Tests');
        return;
    }

    recognizer = new LuisRecognizer({
        appId: luisAppId,
        subscriptionKey: luisSubscriptionKey,
        serviceEndpoint: luisUriBase
    });

    this.timeout(20000);

    it('LuisRecognizer Middleware', assertBotLogicWithTranscript('LuisTests/LuisMiddleware.chat', LuisTestLogic, (adapter) => adapter.use(recognizer)));
});

function LuisTestLogic(conversationState, userState) {
    return async (context) => {
        var luisResult = recognizer.get(context);
        var intent = LuisRecognizer.topIntent(luisResult);
        if (intent !== 'None') {
            await context.sendActivity(`intent:${intent}`);
        } else {
            await context.sendActivity('default message');
        }
    }
}