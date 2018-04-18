const assert = require('assert');
const { ActivityTypes } = require('botbuilder-core');
const { TestAdapter, TranscriptLoggerMiddleware, MemoryTranscriptStore } = require('../');

describe(`TranscriptLoggerMiddleware`, function () {
    this.timeout(5000);

    it(`should log activities`, function (done) {
        var conversationId = null;
        var transcriptStore = new MemoryTranscriptStore();
        var adapter = new TestAdapter(context => {
            conversationId = context.activity.conversation.id;
            var typingActivity = {
                type: ActivityTypes.Typing,
                relatesTo: context.activity.relatesTo
            };

            context.sendActivity(typingActivity);
            context.sendActivity(`echo:${context.activity.text}`);

        }).use(new TranscriptLoggerMiddleware(transcriptStore));

        adapter
            .send('foo')
                .assertReply(activity => assert.equal(activity.type, ActivityTypes.Typing))
                .assertReply('echo:foo')
            .send('bar')
                .assertReply(activity => assert.equal(activity.type, ActivityTypes.Typing))
                .assertReply('echo:bar')
            .then(() => done());
    });
});
