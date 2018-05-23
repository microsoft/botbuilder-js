const path = require('path');
const { MemoryStorage, TestAdapter, ConversationState } = require('botbuilder-core-extensions');
const TranscriptUtilities = require('../libraries/botbuilder-core-extensions/tests/transcriptUtilities');

module.exports.testBotWithTranscript = function testBotWithTranscript(transcriptPath, botLogicFactoryFun) {
    var loadFun = transcriptPath.endsWith('.chat') ? TranscriptUtilities.getActivitiesFromChat : TranscriptUtilities.getActivitiesFromTranscript;
    return function (done) {
        loadFun(transcriptPath).then(activities => {
            const convoState = new ConversationState(new MemoryStorage());
            var adapter = new TestAdapter(botLogicFactoryFun(convoState));
            adapter.use(convoState);
            return adapter.testActivities(activities)
                .then(done)
                .catch(done);
        });
    }
}