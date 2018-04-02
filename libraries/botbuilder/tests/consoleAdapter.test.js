const assert = require('assert');
const { TurnContext } = require('botbuilder-core');
const { ConsoleAdapter } = require('../');

const reference = { 
    activityId: '1234', 
    channelId: 'test', 
    serviceUrl: 'https://example.org/channel',
    user: { id: 'user', name: 'User Name' },
    bot: { id: 'bot', name: 'Bot Name' },
    conversation: { id: 'convo1' }   
};
const outgoingMessage = TurnContext.applyConversationReference({ text: 'test', type: 'message' }, reference);
const singleAttachmentMessage = TurnContext.applyConversationReference({ text: 'test', type: 'message', attachments: [{ contentType: 'foo' }] }, reference);
const multiAttachmentMessage = TurnContext.applyConversationReference({ text: 'test', type: 'message', attachments: [{ contentType: 'foo' }, { contentType: 'foo' }] }, reference);
const delayActivity = { type: 'delay', value: 500 };

class AdapterUnderTest extends ConsoleAdapter {
    constructor(onPrint) {
        super();
        this.onPrint = onPrint;
        this.onLine = undefined;
        this.open = false;
        this.sent = 0;
    }

    input(text) {
        assert(this.open, `not listening.`);
        assert(this.onLine, `no callback to call.`);
        return this.onLine(text);
    }

    sendActivities(context, activities) {
        this.sent = activities.length;
        return super.sendActivities(context, activities);
    }

    testCreateInterface() {
        return super.createInterface({ input: process.stdin, output: process.stdout, terminal: false });    
    }

    createInterface(options) {
        const that = this;
        return {
            on(event, callback) {
                that.open = true;
                that.onLine = callback;
            },
            close() {
                that.open = false;
            }
        }
    }

    print(line) {
        if (this.onPrint) { this.onPrint(line) }
        super.print(line);
    }

    printError(line) {
        if (this.onPrint) { this.onPrint(line) }
        super.printError(line);
    }
}

describe(`ConsoleAdapter`, function () {
    this.timeout(5000);

    it(`should listen() for console input.`, function (done) {
        const adapter = new AdapterUnderTest();
        adapter.listen((context) => {
            assert(context, `No context passed.`);
            assert(context.activity && context.activity.text === 'test', `Invalid activity text passed.`);
            done();
        });
        adapter.input('test');
    });

    it(`should continueConversation().`, function (done) {
        const adapter = new AdapterUnderTest();
        adapter.continueConversation(reference, (context) => {
            assert(context, `No context passed.`);
            assert(context.activity && context.activity.type === undefined, `Invalid activity type passed.`);
            done();
        });
        adapter.input('test');
    });
    
    it(`should send text reply to user via sendActivity().`, function (done) {
        const adapter = new AdapterUnderTest();
        adapter.listen((context) => {
            assert(context, `No context passed.`);
            assert(context.activity && context.activity.text === 'test', `Invalid activity text passed.`);
            return context.sendActivity(`output`).then(() => {
                assert(adapter.sent === 1, `Activity not sent.`);
                done();
            });
        });
        adapter.input('test');
    });

    it(`should send reply activity to user via sendActivity().`, function (done) {
        const adapter = new AdapterUnderTest();
        adapter.listen((context) => {
            return context.sendActivity(outgoingMessage).then(() => {
                assert(adapter.sent === 1, `Activity not sent.`);
                done();
            });
        });
        adapter.input('test');
    });
    
    it(`should send multiple replies to user via sendActivity().`, function (done) {
        const adapter = new AdapterUnderTest();
        adapter.listen((context) => {
            return context.sendActivities([outgoingMessage, outgoingMessage, outgoingMessage]).then(() => {
                assert(adapter.sent === 3, `Invalid number of activities sent.`);
                done();
            });
        });
        adapter.input('test');
    });

    it(`should append "(1 attachment)" to output.`, function (done) {
        const adapter = new AdapterUnderTest((output) => {
            assert(output.endsWith(`(1 attachment)` ), `Attachment count not appended.`);
            done();
        });
        adapter.listen((context) => {
            return context.sendActivity(singleAttachmentMessage);
        });
        adapter.input('test');
    });

    it(`should append "(2 attachments)" to output.`, function (done) {
        const adapter = new AdapterUnderTest((output) => {
            assert(output.endsWith(`(2 attachments)` ), `Attachment count not appended.`);
            done();
        });
        adapter.listen((context) => {
            return context.sendActivity(multiAttachmentMessage);
        });
        adapter.input('test');
    });

    it(`should print all activity types to output.`, function (done) {
        const adapter = new AdapterUnderTest((output) => {
            assert(output.endsWith(`[event]` ), `Event not written.`);
            done();
        });
        adapter.listen((context) => {
            return context.sendActivity({ type: 'event' });
        });
        adapter.input('test');
    });
    
    it(`should delay between send multiple replies to user via sendActivity().`, function (done) {
        let printCnt = 0;
        const adapter = new AdapterUnderTest((output) => printCnt++);
        adapter.listen((context) => {
            const start = new Date().getTime();
            return context.sendActivities([outgoingMessage, delayActivity, outgoingMessage]).then(() => {
                const duration = (new Date().getTime() - start) + 10;
                assert(adapter.sent === 3, `Invalid number of activities sent.`);
                assert(printCnt === 2, `Invalid number of activities output.`);
                assert(duration > delayActivity.value, `adapter didn't delay`);
                done();
            });
        });
        adapter.input('test');
    });

    it(`should return error from updateActivity().`, function (done) {
        const adapter = new AdapterUnderTest();
        adapter.listen((context) => {
            return context.updateActivity(outgoingMessage).then(
                () => {
                    assert(false, `method should fail.`);
                },
                (err) => {
                    assert(err, `error not passed.`);
                    done();
                }
            );
        });
        adapter.input('test');
    });
    
    it(`should return error from deleteActivity().`, function (done) {
        const adapter = new AdapterUnderTest();
        adapter.listen((context) => {
            return context.deleteActivity(reference).then(
                () => {
                    assert(false, `method should fail.`);
                },
                (err) => {
                    assert(err, `error not passed.`);
                    done();
                }
            );
        });
        adapter.input('test');
    });

    it(`should return close function from listen().`, function (done) {
        const adapter = new AdapterUnderTest();
        const close = adapter.listen((context) => {
        });
        assert(adapter.open, `adapter not opened.`);
        assert(typeof close === 'function', `function not returned.`);
        close();
        assert(!adapter.open, `adapter didn't close.`);
        done();
    });
    
    it(`should return interface from createInterface().`, function (done) {
        const adapter = new AdapterUnderTest();
        const rl = adapter.testCreateInterface();
        assert(typeof rl === 'object' && rl.close, `interface not returned.`);
        rl.close();
        done();
    });

    it(`should catch and log error thrown in listen().`, function (done) {
        const adapter = new AdapterUnderTest((output) => {
            assert(output, `error text not printed`);
            done();
        });
        adapter.listen((context) => {
            throw new Error(`exception`);
        });
        adapter.input('test');
    });

    it(`should catch and log error thrown in continueConversation().`, function (done) {
        const adapter = new AdapterUnderTest((output) => {
            assert(output, `error text not printed`);
            done();
        });
        adapter.continueConversation(reference, (context) => {
            throw new Error(`exception`);
        });
    });
});