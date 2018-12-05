const assert = require('assert');
const { TestAdapter, TranscriptLoggerMiddleware, MemoryTranscriptStore, ActivityTypes } = require('../');

class SyncErrorLogger {
    logActivity(activity) {
        throw new Error();
    }
}

class AsyncErrorLogger {
    async logActivity(activity) {
        throw new Error();
    }
}

class SyncThrowerLogger {
    logActivity(activity) {
        throw 1;
    }
}

class AsyncThrowerLogger {
    async logActivity(activity) {
        throw 2;
    }
}


describe(`TranscriptLoggerMiddleware`, function () {
    this.timeout(5000);

    it(`should log activities`, function (done) {
        var conversationId = null;
        var transcriptStore = new MemoryTranscriptStore();
        var adapter = new TestAdapter(async (context) => {
            conversationId = context.activity.conversation.id;
            var typingActivity = {
                type: ActivityTypes.Typing,
                relatesTo: context.activity.relatesTo
            };

            await context.sendActivity(typingActivity);
            await context.sendActivity(`echo:${context.activity.text}`);

        }).use(new TranscriptLoggerMiddleware(transcriptStore));

        adapter
            .send('foo')
            .assertReply(activity => assert.equal(activity.type, ActivityTypes.Typing))
            .assertReply('echo:foo')
            .send('bar')
            .assertReply(activity => assert.equal(activity.type, ActivityTypes.Typing))
            .assertReply('echo:bar')
            .then(() => {
                transcriptStore.getTranscriptActivities('test', conversationId).then(pagedResult => {
                    assert.equal(pagedResult.items.length, 6);
                    assert.equal(pagedResult.items[0].text, 'foo');
                    assert.equal(pagedResult.items[1].type, ActivityTypes.Typing);
                    assert.equal(pagedResult.items[2].text, 'echo:foo');
                    assert.equal(pagedResult.items[3].text, 'bar');
                    assert.equal(pagedResult.items[4].type, ActivityTypes.Typing);
                    assert.equal(pagedResult.items[5].text, 'echo:bar');
                    pagedResult.items.forEach(a => {
                        assert(a.timestamp);
                    })
                    done();
                });
            });
    });

    it(`should log update activities`, function (done) {
        var conversationId = null;
        let activityToUpdate = null;
        var transcriptStore = new MemoryTranscriptStore();
        var adapter = new TestAdapter(async (context) => {
            conversationId = context.activity.conversation.id;
            if (context.activity.text === 'update') {
                activityToUpdate.text = 'new response';
                await context.updateActivity(activityToUpdate);
            } else {
                var activity = createReply(context.activity, 'response');
                const response = await context.sendActivity(activity);
                activity.id = response.id;

                // clone the activity, so we can use it to do an update
                activityToUpdate = JSON.parse(JSON.stringify(activity));
            }

        }).use(new TranscriptLoggerMiddleware(transcriptStore));

        adapter
            .send('foo')
            .delay(100)
            .send('update')
            .delay(100)
            .then(() => {
                transcriptStore.getTranscriptActivities('test', conversationId).then(pagedResult => {
                    assert(pagedResult.items.length, 4);
                    assert(pagedResult.items[0].text, 'foo');
                    assert(pagedResult.items[1].text, 'response');
                    assert(pagedResult.items[2].text, 'new response');
                    assert(pagedResult.items[3].text, 'update');
                    done();
                });
            });

    });

    it(`should log delete activities`, function(done) {
        var conversationId = null;
        var activityId = null;
        var transcriptStore = new MemoryTranscriptStore();
        var adapter = new TestAdapter(async (context) => {
            conversationId = context.activity.conversation.id;
            if(context.activity.text === 'deleteIt') {
                await context.deleteActivity(activityId);
            } else {
                var activity = createReply(context.activity, 'response');
                var response = await context.sendActivity(activity);
                activityId = response.id;
            }
        }).use(new TranscriptLoggerMiddleware(transcriptStore));

        adapter.send('foo')
            .assertReply('response')
            .send('deleteIt')
            .delay(500).then(() => {
                transcriptStore.getTranscriptActivities('test', conversationId).then(pagedResult => {
                    assert(pagedResult.items.length, 4);
                    assert(pagedResult.items[0].text, 'foo');
                    assert(pagedResult.items[1].text, 'response');
                    assert(pagedResult.items[2].text, 'deleteIt');
                    assert(pagedResult.items[3].type, ActivityTypes.MessageDelete);
                    done();
                });
            })
    });

    describe('\'s error handling', function () {
        const originalConsoleError = console.error;

        this.afterEach(function () {
            console.error = originalConsoleError;
        })

        function stubConsoleError(done, expectedErrorMessage, expectedErrors = 1) {
            let errorCounter = 0;      
            console.error = function (error) {
                // We only care about the error message on the first error.
                if (errorCounter === 0) {
                    if (expectedErrorMessage) {
                        assert(error.startsWith(expectedErrorMessage), `unexpected error message received: ${ error }`);
                    } else {
                        assert(error.startsWith('TranscriptLoggerMiddleware logActivity failed'), `unexpected error message received: ${ error }`);
                    }
                }
                errorCounter++;

                if (expectedErrors === errorCounter)  {
                    done();
                } if (errorCounter > expectedErrors) {
                    throw new Error(`console.error() called too many times.`);
                }
            }
        }

        it(`should print to console errors from synchronous logActivity()`, function (done) {
            stubConsoleError(done, undefined, 2);
            var adapter = new TestAdapter(async (context) => {
            }).use(new TranscriptLoggerMiddleware(new SyncErrorLogger()));
    
            adapter.send('test');
        });

        it(`should print to console errors from asynchronous logActivity().`, function (done) {
            stubConsoleError(done, undefined, 2);
            var adapter = new TestAdapter(async (context) => {
            }).use(new TranscriptLoggerMiddleware(new AsyncErrorLogger()));
    
            adapter.send('test');
        });

        it(`should print to console thrown info from synchronous logActivity()`, function (done) {
            stubConsoleError(done, 'TranscriptLoggerMiddleware logActivity failed: "1"');
            var adapter = new TestAdapter(async (context) => {
            }).use(new TranscriptLoggerMiddleware(new SyncThrowerLogger()));
    
            adapter.send('test');
        });

        it(`should print to console thrown info from asynchronous logActivity().`, function (done) {
            stubConsoleError(done, 'TranscriptLoggerMiddleware logActivity failed: "2"');
            var adapter = new TestAdapter(async (context) => {
            }).use(new TranscriptLoggerMiddleware(new AsyncThrowerLogger()));
    
            adapter.send('test');
        });
    });
});


function createReply(activity, text, locale = null) {
    return {
        type: ActivityTypes.Message,
        from: { id: activity.recipient.id, name: activity.recipient.name },
        recipient: { id: activity.from.id, name: activity.from.name },
        replyToId: activity.id,
        serviceUrl: activity.serviceUrl,
        channelId: activity.channelId,
        conversation: { isGroup: activity.conversation.isGroup, id: activity.conversation.id, name: activity.conversation.name },
        text: text || '',
        locale: locale || activity.locale
    };
}