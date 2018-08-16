const assert = require('assert');

const { TestAdapter } = require('botbuilder');
const botLogic = require('./bot');
const TranscriptUtilities = require('../../libraries/botbuilder-core/tests/transcriptUtilities');

describe(`ConversationUpdate`, function () {
    this.timeout(5000);

    it('test using transcript', function (done) {
        TranscriptUtilities.getActivitiesFromTranscript('./bot.transcript').then(activities => {
            var adapter = new TestAdapter(botLogic);
            return adapter.testActivities(activities)
                .then(done)
                .catch(done);
        });
    });
});