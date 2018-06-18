const assert = require('assert');

const { BotState, UserState, MemoryStorage, TestAdapter, ConversationState } = require('botbuilder-core-extensions');
const TranscriptUtilities = require('../../libraries/botbuilder-core-extensions/tests/transcriptUtilities');
const createBotLogic = require('./bot');

describe(`MultiplePrompts`, function () {
    this.timeout(5000);

    function getAdapter() {
        const convoState = new ConversationState(new MemoryStorage());
        const bot = createBotLogic(convoState);
        var adapter = new TestAdapter(bot);
        adapter.use(convoState);
        return adapter;
    };

    it('test using transcript', function (done) {
        TranscriptUtilities.getActivitiesFromChat('./bot.chat').then(activities => {
            var adapter = getAdapter();
            return adapter.testActivities(activities)
                .then(done)
                .catch(done);
        });
    });
});