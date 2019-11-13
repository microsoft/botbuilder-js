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

    it(`should not error for sent activities if no ResourceResponses are received`, async () => {
        class NoResourceResponseAdapter extends TestAdapter {
            constructor(logic) {
                super(logic);
            }

            // Send activities but don't pass the ResourceResponses to the TranscriptLoggerMiddleware
            async sendActivities(context, activities) {
                await super.sendActivities(context, activities);
            }
        }

        let conversationId = null;
        const transcriptStore = new MemoryTranscriptStore();
        const adapter = new NoResourceResponseAdapter(async (context) => {
            conversationId = context.activity.conversation.id;
            const typingActivity = {
                type: ActivityTypes.Typing,
                relatesTo: context.activity.relatesTo
            };

            await context.sendActivity(typingActivity);
            await context.sendActivity(`echo:${context.activity.text}`);

        }).use(new TranscriptLoggerMiddleware(transcriptStore));

        await adapter.send('foo')
            .assertReply(activity => assert.equal(activity.type, ActivityTypes.Typing))
            .assertReply('echo:foo')
            .send('bar')
            .assertReply(activity => assert.equal(activity.type, ActivityTypes.Typing))
            .assertReply('echo:bar');

        const pagedResult = await transcriptStore.getTranscriptActivities('test', conversationId);
        assert.equal(pagedResult.items.length, 6);
        assert.equal(pagedResult.items[0].text, 'foo');
        assert.equal(pagedResult.items[1].type, ActivityTypes.Typing);
        assert.equal(pagedResult.items[2].text, 'echo:foo');
        assert.equal(pagedResult.items[3].text, 'bar');
        assert.equal(pagedResult.items[4].type, ActivityTypes.Typing);
        assert.equal(pagedResult.items[5].text, 'echo:bar');
        pagedResult.items.forEach(a => {
            assert(a.timestamp);
        });
    });

    it(`should not error for sent activities if another handler does not return next()`, async () => {
        class NoResourceResponseMiddleware {
            async onTurn(context, next) {
                context.onSendActivities(async (context, activities, next) => {
                    // In SendActivitiesHandlers developers are supposed to call:
                    //      return next();
                    // If this is not returned, then the next handler will not have the ResourceResponses[].
                    const responses = await next();
                });

                // Run the bot's application logic.
                await next();
            }
        }

        let conversationId = null;
        const transcriptStore = new MemoryTranscriptStore();
        const adapter = new TestAdapter(async (context) => {
            conversationId = context.activity.conversation.id;
            const typingActivity = {
                type: ActivityTypes.Typing,
                relatesTo: context.activity.relatesTo
            };

            await context.sendActivity(typingActivity);
            await context.sendActivity(`echo:${context.activity.text}`);

        });

        // Register both middleware
        adapter.use(new TranscriptLoggerMiddleware(transcriptStore));
        adapter.use(new NoResourceResponseMiddleware());

        await adapter.send('foo')
            .assertReply(activity => assert.equal(activity.type, ActivityTypes.Typing))
            .assertReply('echo:foo')
            .send('bar')
            .assertReply(activity => assert.equal(activity.type, ActivityTypes.Typing))
            .assertReply('echo:bar');

        const pagedResult = await transcriptStore.getTranscriptActivities('test', conversationId);
        assert.equal(pagedResult.items.length, 6);
        assert.equal(pagedResult.items[0].text, 'foo');
        assert.equal(pagedResult.items[1].type, ActivityTypes.Typing);
        assert.equal(pagedResult.items[2].text, 'echo:foo');
        assert.equal(pagedResult.items[3].text, 'bar');
        assert.equal(pagedResult.items[4].type, ActivityTypes.Typing);
        assert.equal(pagedResult.items[5].text, 'echo:bar');
        pagedResult.items.forEach(a => {
            assert(a.timestamp);
        });
    });

    it(`should not error for sent activities if another handler does not return an array`, async () => {
        class NoResourceResponseMiddleware {
            async onTurn(context, next) {
                context.onSendActivities(async (context, activities, next) => {
                    // In SendActivitiesHandlers developers are supposed to call:
                    //      return next();
                    // If this is not returned, then the next handler will not have the ResourceResponses[].
                    const responses = await next();

                    return {};
                });

                // Run the bot's application logic.
                await next();
            }
        }

        let conversationId = null;
        const transcriptStore = new MemoryTranscriptStore();
        const adapter = new TestAdapter(async (context) => {
            conversationId = context.activity.conversation.id;
            await context.sendActivity(`echo:${context.activity.text}`);
        });

        // Register both middleware
        adapter.use(new TranscriptLoggerMiddleware(transcriptStore));
        adapter.use(new NoResourceResponseMiddleware());

        await adapter.send('foo')
            .assertReply('echo:foo');

        const pagedResult = await transcriptStore.getTranscriptActivities('test', conversationId);
        assert.equal(pagedResult.items.length, 2);
        assert.equal(pagedResult.items[0].text, 'foo');
        assert.equal(pagedResult.items[1].text, 'echo:foo');
        pagedResult.items.forEach(a => {
            assert(a.id);
            assert(a.timestamp);
        });
    });

    it(`should not error when logging sent activities and return the actual value from next()`, async () => {
        // This middleware should receive 1 from `next()`
        class AssertionMiddleware {
            async onTurn(context, next) {
                context.onSendActivities(async (context, activities, next) => {
                    const notResourceResponses = await next();
                    assert.strictEqual(notResourceResponses, 1);
                });

                await next();
            }
        }
        // This middleware returns the value 1 from its registered SendActivitiesHandler.
        // The TranscriptLoggerMiddleware should return this value to the next registered SendActivitiesHandler.
        class Returns1Middleware {
            async onTurn(context, next) {
                context.onSendActivities(async (context, activities, next) => {
                    // In SendActivitiesHandlers developers are supposed to call:
                    //      return next();
                    // If this is not returned, then the next handler will not have the ResourceResponses[].
                    const responses = await next();

                    return 1;
                });

                await next();
            }
        }

        let conversationId = null;
        const transcriptStore = new MemoryTranscriptStore();
        const adapter = new TestAdapter(async (context) => {
            conversationId = context.activity.conversation.id;
            await context.sendActivity(`echo:${context.activity.text}`);
        });

        adapter.use(new AssertionMiddleware());
        adapter.use(new TranscriptLoggerMiddleware(transcriptStore));
        adapter.use(new Returns1Middleware());

        await adapter.send('foo')
            .assertReply('echo:foo');

        const pagedResult = await transcriptStore.getTranscriptActivities('test', conversationId);
        assert.equal(pagedResult.items.length, 2);
        assert.equal(pagedResult.items[0].text, 'foo');
        assert.equal(pagedResult.items[1].text, 'echo:foo');
        pagedResult.items.forEach(a => {
            assert(a.id);
            assert(a.timestamp);
        });
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

    it(`should add resource response id to activity when activity id is empty`, function (done) {
        let conversationId = null;
        const transcriptStore = new MemoryTranscriptStore();
        const adapter = new TestAdapter(async (context) => {
            conversationId = context.activity.conversation.id;

            await context.sendActivity(`echo:${context.activity.text}`);
        }).use(new TranscriptLoggerMiddleware(transcriptStore));

        const fooActivity = {
            type: ActivityTypes.Message,
            id: 'testFooId',
            text: 'foo'
        };

        adapter
            .send(fooActivity)
            // sent activities do not contain the id returned from the service, so it should be undefined here
            .assertReply(activity => assert.equal(activity.id, undefined) && assert.equal(activity.text, 'echo:foo')) 
            .send('bar')
            .assertReply(activity => assert.equal(activity.id, undefined) && assert.equal(activity.text, 'echo:bar'))
            .then(() => {
                transcriptStore.getTranscriptActivities('test', conversationId).then(pagedResult => {
                    assert.equal(pagedResult.items.length, 4);
                    assert.equal(pagedResult.items[0].text, 'foo');
                    // Transcript activities should have the id present on the activity when received
                    assert.equal(pagedResult.items[0].id, 'testFooId');

                    assert.equal(pagedResult.items[1].text, 'echo:foo');
                    // Sent Activities in the transcript store should have the Id returned from Resource Response 
                    // (the test adapter increments a number and uses this for the id)
                    assert.equal(pagedResult.items[1].id, '0');

                    assert.equal(pagedResult.items[2].text, 'bar');
                    // Received activities also auto-add the incremental from the test adapter
                    assert.equal(pagedResult.items[2].id, '1');

                    assert.equal(pagedResult.items[3].text, 'echo:bar');
                    assert.equal(pagedResult.items[3].id, '2');
                    pagedResult.items.forEach(a => {
                        assert(a.timestamp);
                    })
                    done();
                });
            })
            .catch(err => done(err));
    });

    it(`should use outgoing activity's timestamp for activity id when activity id and resourceResponse is empty`, async () => {
        let conversationId, timestamp;
        const transcriptStore = new MemoryTranscriptStore();

        const adapter = createTestAdapterWithNoResourceResponseId(async (context) => {
            conversationId = context.activity.conversation.id;

            timestamp = new Date(Date.now());
            await context.sendActivity({
                text: `echo:${ context.activity.text }`,
                timestamp: timestamp,
                type: ActivityTypes.Message
            });
        }).use(new TranscriptLoggerMiddleware(transcriptStore));

        const fooActivity = {
            type: ActivityTypes.Message,
            id: 'testFooId',
            text: 'foo'
        };

        await adapter.send(fooActivity)
            // sent activities do not contain the id returned from the service, so it should be undefined here
            .assertReply(activity => {
                assert.equal(activity.id, undefined);
                assert.equal(activity.text, 'echo:foo');
                assert.equal(activity.timestamp, timestamp);
            });
        
        const pagedResult = await transcriptStore.getTranscriptActivities('test', conversationId);
        assert.equal(pagedResult.items.length, 2);
        assert.equal(pagedResult.items[0].text, 'foo');
        // Transcript activities should have the id present on the activity when received
        assert.equal(pagedResult.items[0].id, 'testFooId');

        assert.equal(pagedResult.items[1].text, 'echo:foo');
        // Sent Activities in the transcript store should use the timestamp on the bot's outgoing activities
        // to log the activity when the following cases are true:
        // 1. The outgoing Activity.id is falsey
        // 2. The ResourceResponse.id is falsey (some channels may not emit a ResourceResponse with an id value)
        // 3. The outgoing Activity.timestamp exists
        assert.equal(pagedResult.items[1].id, timestamp.getTime().toString());
        pagedResult.items.forEach(a => {
            assert(a.timestamp);
        });
    });

    it(`should use current server time for activity id when activity and resourceResponse id is empty and no activity timestamp exists`, function(done) {
        let conversationId;
        const transcriptStore = new MemoryTranscriptStore();

        const adapter = createTestAdapterWithNoResourceResponseId(async (context) => {
            conversationId = context.activity.conversation.id;

            await context.sendActivity({
                text: `echo:${ context.activity.text }`,
                type: ActivityTypes.Message
            });
        }).use(new TranscriptLoggerMiddleware(transcriptStore));

        const fooActivity = {
            type: ActivityTypes.Message,
            id: 'testFooId',
            text: 'foo'
        };

        adapter
            .send(fooActivity)
            // sent activities do not contain the id returned from the service, so it should be undefined here
            .assertReply(activity => {
                assert.equal(activity.id, undefined);
                assert.equal(activity.text, 'echo:foo');
            }) 
            .then(() => {
                transcriptStore.getTranscriptActivities('test', conversationId).then(pagedResult => {
                    assert.equal(pagedResult.items.length, 2);
                    assert.equal(pagedResult.items[0].text, 'foo');
                    // Transcript activities should have the id present on the activity when received
                    assert.equal(pagedResult.items[0].id, 'testFooId');

                    assert.equal(pagedResult.items[1].text, 'echo:foo');
                    // Sent Activities in the transcript store should use the time the TranscriptLoggerMiddleware attempted 
                    // to log the activity when the following cases are true:
                    // 1. The outgoing Activity.id is falsey
                    // 2. The ResourceResponse.id is falsey (some channels may not emit a ResourceResponse with an id value)
                    // 3. The outgoing Activity.timestamp is falsey
                    assert(pagedResult.items[1].id);
                    pagedResult.items.forEach(a => {
                        assert(a.timestamp);
                    });
                    done();
                });
            });
    });
});

function createTestAdapterWithNoResourceResponseId(logic) {
    const modifiedAdapter = new TestAdapter(logic);

    function sendActivities(context, activities) {
        const responses = activities
            .filter((a) => this.sendTraceActivities || a.type !== 'trace')
            .map((activity) => {
                this.activityBuffer.push(activity);
                return { };
            });
        
        return Promise.resolve(responses);
    }
    modifiedAdapter.sendActivities = sendActivities.bind(modifiedAdapter);

    return modifiedAdapter;
}


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