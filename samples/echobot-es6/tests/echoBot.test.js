const assert = require('assert');

const { BotState, UserState, MemoryStorage, TestAdapter, ConversationState } = require('botbuilder-core-extensions');
const CreateEchoBot = require('../echoBot');
const TranscriptUtilities = require('../../../libraries/botbuilder-core-extensions/tests/transcriptUtilities');

describe(`EchoBot`, function () {
    this.timeout(5000);

    function getAdapter() {
        const convoState = new ConversationState(new MemoryStorage());
        const bot = CreateEchoBot(convoState);
        var adapter = new TestAdapter(bot);
        adapter.use(convoState);
        return adapter;
    };

    it('test using .chat', function (done) {
        TranscriptUtilities.getActivitiesFromChat('./tests/echoBot.chat').then(activities => {
            var adapter = getAdapter();
            return adapter.testActivities(activities, 'echobot.chat')
                .then(done)
                .catch(done);
        });
    });
});
