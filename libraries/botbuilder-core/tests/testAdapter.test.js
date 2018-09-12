const assert = require('assert');
const { TestAdapter, ActivityTypes } = require('../');

const receivedMessage = { text: 'received', type: 'message' };
const updatedActivity = { text: 'update', type: 'message' };
const deletedActivityId = '1234';

describe(`TestAdapter`, function () {
    this.timeout(5000);

    it(`should call bot logic when receiveActivity() is called.`, function (done) {
        const adapter = new TestAdapter((context) => {
            assert(context, `context not passed to bot logic.`);
            assert(context.activity, `activity not passed through.`);
            assert(context.activity.type === ActivityTypes.Message, `wrong type.`);
            assert(context.activity.text === 'test', `wrong text.`);
            assert(context.activity.id, `missing id.`);
            assert(context.activity.from, `missing from.`);
            assert(context.activity.recipient, `missing recipient.`);
            assert(context.activity.conversation, `missing conversation.`);
            assert(context.activity.channelId, `missing channelId.`);
            assert(context.activity.serviceUrl, `missing serviceUrl.`);
            done();
        });
        adapter.receiveActivity('test');
    });

    it(`should support receiveActivity() called with an Activity.`, function (done) {
        const adapter = new TestAdapter((context) => {
            assert(context.activity.type === ActivityTypes.Message, `wrong type.`);
            assert(context.activity.text === 'test', `wrong text.`);
            done();
        });
        adapter.receiveActivity({ text: 'test', type: ActivityTypes.Message });
    });

    it(`should automatically set the type when receiveActivity() is called with an Activity.`, function (done) {
        const adapter = new TestAdapter((context) => {
            assert(context.activity.type === ActivityTypes.Message, `wrong type.`);
            assert(context.activity.text === 'test', `wrong text.`);
            done();
        });
        adapter.receiveActivity({ text: 'test' });
    });

    it(`should support passing your own Activity.Id to receiveActivity().`, function (done) {
        const adapter = new TestAdapter((context) => {
            assert(context.activity.id === 'myId', `custom ID not passed through.`);
            assert(context.activity.type === ActivityTypes.Message, `wrong type.`);
            assert(context.activity.text === 'test', `wrong text.`);
            done();
        });
        adapter.receiveActivity({ text: 'test', type: ActivityTypes.Message, id: 'myId' });
    });


    it(`should call bot logic when send() is called.`, function (done) {
        const adapter = new TestAdapter((context) => {
            done();
        }).send('test');
    });

    it(`should return a message to assertReply().`, function (done) {
        const adapter = new TestAdapter((context) => {
            return context.sendActivity(receivedMessage);
        });
        adapter.send('test')
            .assertReply('received')
            .then(() => done());
    });

    it(`async startTest().`, async function () {
        const adapter = new TestAdapter((context) => {
            return context.sendActivity(receivedMessage);
        });

        await adapter.send('test')
            .assertReply('received')
            .startTest();
    });

    it(`should send and receive when test() is called.`, function (done) {
        const adapter = new TestAdapter((context) => {
            return context.sendActivity(receivedMessage);
        });
        adapter.test('test', 'received')
            .then(() => done());
    });

    it(`should support multiple calls to test().`, function (done) {
        let count = 0;
        const adapter = new TestAdapter((context) => {
            count++;
            return context.sendActivity(receivedMessage);
        });
        adapter.test('test', 'received')
            .test('test', 'received')
            .test('test', 'received')
            .test('test', 'received')
            .test('test', 'received')
            .then(() => {
                assert(count == 5, `incorrect count of "${count}".`);
                done();
            });
    });

    it(`should support context.updateActivity() calls.`, function (done) {
        const adapter = new TestAdapter((context) => {
            return context.updateActivity(updatedActivity)
                .then(() => context.sendActivity(receivedMessage));
        });
        adapter.test('test', 'received')
            .then(() => {
                assert(adapter.updatedActivities.length === 1, `no activities updated.`);
                assert(adapter.updatedActivities[0].text === updatedActivity.text, `invalid update activity.`);
                done();
            });
    });

    it(`should support context.deleteActivity() calls.`, function (done) {
        const adapter = new TestAdapter((context) => {
            return context.deleteActivity({ activityId: deletedActivityId })
                .then(() => context.sendActivity(receivedMessage));
        });
        adapter.test('test', 'received')
            .then(() => {
                assert(adapter.deletedActivities.length === 1, `no activities deleted.`);
                assert(adapter.deletedActivities[0].activityId === deletedActivityId, `invalid deleted activity id.`);
                done();
            });
    });

    it(`should delay() before running another test.`, function (done) {
        const start = new Date().getTime();
        const adapter = new TestAdapter((context) => {
            return context.sendActivity(receivedMessage);
        });
        adapter
            .test('test', 'received')
            .delay(600)
            .test('test', 'received')
            .then(() => {
                const end = new Date().getTime();
                assert((end - start) >= 500, `didn't delay before moving on.`);
                done();
            });
    });

    it(`should support calling assertReply() with an expected Activity.`, function (done) {
        const start = new Date().getTime();
        const adapter = new TestAdapter((context) => {
            return context.sendActivity(receivedMessage);
        });
        adapter
            .send('test')
            .assertReply({ text: 'received' })
            .then(() => done());
    });

    it(`should support calling assertReply() with a custom inspector.`, function (done) {
        let called = false;
        const start = new Date().getTime();
        const adapter = new TestAdapter((context) => {
            return context.sendActivity(receivedMessage);
        });
        adapter
            .send('test')
            .assertReply((reply, description) => {
                assert(reply, `reply not passed`);
                called = true;
            })
            .then(() => {
                assert(called, `inspector not called.`);
                done();
            });
    });

    it(`should timeout waiting for assertReply() when a string is expected.`, function (done) {
        const start = new Date().getTime();
        const adapter = new TestAdapter((context) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => resolve(), 600);
            });
        });
        adapter
            .send('test')
            .assertReply('received', 'received failed', 500)
            .catch((err) => done());
    });

    it(`should timeout waiting for assertReply() when an Activity is expected.`, function (done) {
        const start = new Date().getTime();
        const adapter = new TestAdapter((context) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => resolve(), 600);
            });
        });
        adapter
            .send('test')
            .assertReply({ text: 'received' }, 'received failed', 500)
            .catch((err) => done());
    });

    it(`should timeout waiting for assertReply() when a custom inspector is expected.`, function (done) {
        const start = new Date().getTime();
        const adapter = new TestAdapter((context) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => resolve(), 600);
            });
        });
        adapter
            .send('test')
            .assertReply(() => assert(false, `inspector shouldn't be called.`), 'received failed', 500)
            .catch((err) => done());
    });

    it(`should support calling assertReplyOneOf().`, function (done) {
        const start = new Date().getTime();
        const adapter = new TestAdapter((context) => {
            return context.sendActivity(receivedMessage);
        });
        adapter
            .send('test')
            .assertReplyOneOf(['foo', 'bar', 'received'])
            .then(() => done());
    });

    it(`should fail assertReplyOneOf() call for invalid response.`, function (done) {
        const start = new Date().getTime();
        const adapter = new TestAdapter((context) => {
            return context.sendActivity(receivedMessage);
        });
        adapter
            .send('test')
            .assertReplyOneOf(['foo', 'bar'])
            .then(() => {
                assert(false, `shouldn't pass test.`);
            })
            .catch(() => done());
    });

    it(`should return an error from continueConversation().`, function (done) {
        const adapter = new TestAdapter((context) => {
            assert(false, `shouldn't run bot logic.`);
        });
        adapter.continueConversation().catch((err) => {
            assert(err, `Error not returned.`);
            done();
        });
    });

    it(`should apply the user-defined Activity template.`, function (done) {
        const template = {
            channelId: 'foo',
            from: { id: 'foo', name: 'Foo' },
        };
        new TestAdapter((context) => {
            assert(context.activity.channelId === template.channelId, `activity channelId does not match template.`);
            assert(context.activity.from.id === template.from.id, `activity from.id does not match template.`);
            assert(context.activity.from.name === template.from.name, `activity from.name does not match template.`);
            assert(context.activity.serviceUrl, `missing serviceUrl.`);
            done();
        }, template).send('test');
    });

    it(`should test activities that have a from.role normalized value of 'bot' via testActivities().`, function (done) {
        // Counter to keep track of how many times the bot logic is run.
        let counter = 0;
        const adapter = new TestAdapter((context) => {
            counter++;
            return context.sendActivity('Greetings User!');
        });

        // We create two activities, one which is a message from the user to the bot.
        // The other is the bot's response.
        // The bot's logic should only run once, when it receives the 'Hello' from the user.
        const activities = [
            {
                from: {
                    role: 'User',
                    name: 'User',
                    id: 'user'
                },
                type: 'message',
                text: 'Hello'
            },
            {
                from: {
                    role: 'Bot',
                    name: 'Bot',
                    id: 'bot'
                },
                type: 'message',
                text: 'Greetings User!'
            }
        ];

        adapter.testActivities(activities).then(() => {
            assert(counter === 1, `should have only run bot logic once.`);
            done();
        });
    });

    it(`should run the bot's logic to activities without a from property via testActivities().`, function (done) {
        let counter = 0;
        const adapter = new TestAdapter((context) => {
            counter++;
        });

        // These conversationUpdate activities should trigger the bot's logic to run.
        const activities = [
            {
                type: 'conversationUpdate',
                membersAdded: [
                    { name: 'Bot', id: 'bot' }
                ]
            },
            {
                type: 'conversationUpdate',
                membersAdded: [
                    { name: 'User', id: 'user' }
                ]
            },
            {
                type: 'conversationUpdate',
                membersRemoved: [
                    { name: 'Bot', id: 'bot' },
                    { name: 'User', id: 'user' }
                ]
            }
        ];

        adapter.testActivities(activities).then(() => {
            assert(counter === 3, `should have run bot logic for activities without the from property.`);
            done();
        });
    });

    it(`should throw error if activities is not passed to testActivities().`, function (done) {
        const adapter = new TestAdapter((context) => {
            return context.sendActivity(context.activity.text);
        });
        try {
            adapter.testActivities()
        } catch (e) {
            assert(e.message === 'Missing array of activities', `wrong error thrown.`);
            done();
        }
        throw new Error(`TestAdapter.testActivities() should not have succeeded without activities argument.`);
    });
});
