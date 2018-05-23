const path = require('path');
const { TestAdapter, MemoryStorage, UserState, ConversationState, BotStateSet } = require('botbuilder-core-extensions');
const TranscriptUtilities = require('../libraries/botbuilder-core-extensions/tests/transcriptUtilities');

module.exports.testBotWithTranscript = function testBotWithTranscript(transcriptPath, botLogicFactoryFun, middlewareRegistrationFun) {

    var loadFun = transcriptPath.endsWith('.chat')
        ? TranscriptUtilities.getActivitiesFromChat
        : TranscriptUtilities.getActivitiesFromTranscript;

    // Return a Mocha Test Definition
    return function (done) {
        loadFun(transcriptPath).then(activities => {
            const storage = new MemoryStorage();
            const conversationState = new ConversationState(storage);
            const userState = new UserState(storage);
            const state = new BotStateSet(conversationState, userState);

            var adapter = new TestAdapter(botLogicFactoryFun(conversationState, userState));
            adapter.use(state);

            if(typeof middlewareRegistrationFun === 'function') {
                middlewareRegistrationFun(adapter, conversationState, userState);
            }

            return adapter.testActivities(activities)
                .then(done)
                .catch(done);
        }).catch(done)
    }
}