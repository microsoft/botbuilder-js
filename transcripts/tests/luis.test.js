const assert = require('assert');
const { LuisRecognizer } = require('botbuilder-ai');
const assertBotLogicWithTranscript = require('../../libraries/botbuilder-core-extensions/tests/transcriptUtilities').assertBotLogicWithBotBuilderTranscript;

var luisAppId = process.env['LUISAPPID'];
var luisSubscriptionKey = process.env['LUISAPPKEY'];
var luisUriBase = process.env['LUISURIBASE'];
var recognizer;

describe(`LUIS Tests using transcripts`, function () {
    if (!luisAppId || !luisSubscriptionKey) {
        console.warn('* Missing LUIS Environment variables (LUISAPPID, LUISAPPKEY) - Skipping LUIS Tests');
        return;
    }

    recognizer = new LuisRecognizer({
        appId: luisAppId,
        subscriptionKey: luisSubscriptionKey,
        serviceEndpoint: luisUriBase
    });

    this.timeout(15000);

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