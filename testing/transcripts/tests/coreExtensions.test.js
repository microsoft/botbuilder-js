const assertBotLogicWithTranscript = require('../../../libraries/botbuilder-core/tests/transcriptUtilities')
    .assertBotLogicWithBotBuilderTranscript;

describe(`Core Extensions Tests using transcripts`, function () {
    this.timeout(10000);

    it(
        'UserStateTest',
        assertBotLogicWithTranscript('CoreExtensionsTests/UserStateTest.chat', (conversationState, userState) =>
            TestLogic(userState)
        )
    );

    it(
        'ConversationStateTest',
        assertBotLogicWithTranscript('CoreExtensionsTests/ConversationStateTest.chat', (conversationState, userState) =>
            TestLogic(conversationState)
        )
    );
});

function TestLogic(botState) {
    return async (context) => {
        var cmd = getCommand(context);
        if (!cmd.name) {
            return;
        }

        await botState.load(context);
        const state = botState.get(context);
        switch (cmd.name) {
            case 'delete':
                delete state.value;
                await botState.saveChanges(context);
                break;
            case 'set':
                state.value = cmd.value;
                await botState.saveChanges(context);
                break;
            case 'read':
                await context.sendActivity(`value:${state.value || ''}`);
                break;
            default:
                await context.sendActivity('bot message');
                break;
        }
    };
}

function getCommand(context) {
    var message = context.activity.text ? context.activity.text.split(' ') : [];
    if (message.length > 1) {
        return {
            name: message[0],
            value: message[1],
        };
    }

    return {
        name: message[0],
        value: null,
    };
}
