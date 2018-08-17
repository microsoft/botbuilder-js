const assert = require('assert');
const assertBotLogicWithTranscript = require('../../libraries/botbuilder-core/tests/transcriptUtilities').assertBotLogicWithBotBuilderTranscript;

xdescribe(`Core Tests using transcripts`, function () {
    this.timeout(10000);

    it('BotAdapted_Bracketing', assertBotLogicWithTranscript('CoreTests/BotAdapted_Bracketing.chat', BotAdapted_Bracketing_Logic, (adapter) => {
        adapter.use(new BeforeAfterMiddleware());
        adapter.use(new CatchExceptionMiddleware());
    }));
});

function BotAdapted_Bracketing_Logic(state) {
    return async (context) => {
        var userMessage = context.activity.text;
        switch (userMessage) {
            case 'use middleware':
                await context.sendActivity('using middleware');
                break;
            case 'catch exception':
                await context.sendActivity('generating exception');
                throw new Error('exception to catch');
        }
    }
}

class BeforeAfterMiddleware {
    async onTurn(context, next) {
        await context.sendActivity('before message');
        await next();
        await context.sendActivity('after message');
    }
}

class CatchExceptionMiddleware {
    async onTurn(context, next) {
        try {
            await next();
        } catch (err) {
            await context.sendActivity(`Caught: ${err.message}`);
        }
    }
}