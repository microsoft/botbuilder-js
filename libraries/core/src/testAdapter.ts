/**
 * @module botbuilder
 */
/** second comment block */
import { ActivityAdapter } from './activityAdapter';
import { Activity, ActivityTypes, ConversationReference } from './activity';
import { Promiseable } from './middleware';
import assert = require('assert');

/**
 * Test adapter used for unit tests.
 * @example
 * <pre><code>
 * const adapter = new TestAdapater();
 * const bot = new Bot(adapter)
 *      .use(new MemoryStorage())
 *      .use(new BotStateManage())
 *      .onReceive((context) => {
 *          const cnt = context.state.conversation.next || 1;
 *          context.reply(`reply: ${cnt}`);
 *          context.state.conversation.next = cnt + 1;
 *      });
 * adapter.test('inc', 'reply: 1')
 *          .test('inc', 'reply: 2')
 *          .test('inc', 'reply: 3')
 *          .then(() => done());
 * </code></pre>
 */
export class TestAdapter implements ActivityAdapter {
    private nextId = 0;

    public reference: ConversationReference;
    public botReplies: Activity[] = [];

    /** INTERNAL implementation of `Adapter.onReceive`. */
    public onReceive: (activity: Activity) => Promise<void>;

    /**
     * Creates a new instance of the test adapter.
     * @param reference (Optional) conversation reference that lets you customize the address 
     * information for messages sent during a test.
     */
    constructor(reference?: ConversationReference) {
        this.reference = <ConversationReference>Object.assign({}, reference, {
            channelId: 'test',
            serviceUrl: 'https://test.com',
            user: { id: 'user', name: 'User1' },
            bot: { id: 'bot', name: 'Bot' },
            conversation: { id: 'Convo1' }
        });
    }

    /** INTERNAL implementation of `Adapter.post()`. */
    public post(activities: Partial<Activity>[]): Promise<undefined> {
        activities.forEach((activity) => this.botReplies.push(activity));
        return Promise.resolve(undefined);
    }

    /* INTERNAL */
    public _sendActivityToBot(userSays: string | Partial<Activity>): Promise<void> {
        // ready for next reply
        let activity = <Activity>(typeof userSays === 'string' ? { type:ActivityTypes.message, text: userSays } : userSays);
        if (!activity.type) 
            throw new Error("Missing activity.type");
        activity.channelId = this.reference.channelId;
        activity.from = this.reference.user;
        activity.recipient = this.reference.bot;
        activity.conversation = this.reference.conversation;
        activity.serviceUrl = this.reference.serviceUrl;
        const id = activity.id = (this.nextId++).toString();
        return this.onReceive(activity).then(result => { });
    }


    /**
     * Send something to the bot
     * @param userSays text or activity simulating user input
     */
    public send(userSays: string | Partial<Activity>): TestFlow {
        return new TestFlow(this._sendActivityToBot(userSays), this);
    }

    /**
     * wait for time period to pass before continuing
     * @param ms ms to wait for
     */
    public delay(ms: number): TestFlow {
        return new TestFlow(new Promise<void>((resolve, reject) => { setTimeout(() => resolve(), ms); }), this);
    }

    /**
     * Send something to the bot and expect the bot to reply
     * @param userSays text or activity simulating user input
     * @param expected expected text or activity from the bot
     * @param description description of test case
     * @param timeout (default 3000ms) time to wait for response from bot
     */
    public test(userSays: string | Partial<Activity>, expected: string | Partial<Activity> | ((activity: Activity, description?: string) => void), description?: string, timeout?: number): TestFlow {
        return this.send(userSays)
            .assertReply(expected, description);
    }

    /**
     * Throws if the bot's response doesn't match the expected text/activity
     * @param expected expected text or activity from the bot
     * @param description description of test case
     * @param timeout (default 3000ms) time to wait for response from bot
     */
    public assertReply(expected: string | Partial<Activity> | ((activity: Activity, description?: string) => void), description?: string, timeout?: number): TestFlow {
        return new TestFlow(Promise.resolve(), this).assertReply(expected, description, timeout);
    }

    /**
     * throws if the bot's response is not one of the candidate strings
     * @param candidates candidate responses
     * @param description description of test case
     * @param timeout (default 3000ms) time to wait for response from bot
     */
    public assertReplyOneOf(candidates: string[], description?: string, timeout?: number): TestFlow {
        return new TestFlow(Promise.resolve(), this).assertReplyOneOf(candidates, description, timeout);
    }
}

/** INTERNAL support class for `TestAdapter`. */
export class TestFlow {

    constructor(public previous: Promise<void>, private adapter: TestAdapter) {
        if (!this.previous)
            this.previous = Promise.resolve();
    }

    /**
     * Send something to the bot and expect the bot to reply
     * @param userSays text or activity simulating user input
     * @param expected expected text or activity from the bot
     * @param description description of test case
     * @param timeout (default 3000ms) time to wait for response from bot
     */
    public test(userSays: string | Partial<Activity>, expected: string | Partial<Activity> | ((activity: Activity, description?: string) => void), description?: string, timeout?: number): TestFlow {
        if (!expected)
            throw new Error(".test() Missing expected parameter");
        return this.send(userSays)
            .assertReply(expected, description || `test("${userSays}", "${expected}")`, timeout);
    }

    /**
     * Send something to the bot
     * @param userSays text or activity simulating user input
     */
    public send(userSays: string | Partial<Activity>): TestFlow {
        return new TestFlow(this.previous.then(() => this.adapter._sendActivityToBot(userSays)), this.adapter);
    }

    /**
     * Throws if the bot's response doesn't match the expected text/activity
     * @param expected expected text or activity from the bot, or callback to inspect object 
     * @param description description of test case
     * @param timeout (default 3000ms) time to wait for response from bot
     */
    public assertReply(expected: string | Partial<Activity> | ((activity: Activity, description?: string) => void), description?: string, timeout?: number): TestFlow {
        if (!expected)
            throw new Error(".assertReply() Missing expected parameter");

        return new TestFlow(this.previous.then(() => {
            return new Promise<void>((resolve, reject) => {
                if (!timeout)
                    timeout = 3000;
                let interval = 0;
                let start = new Date().getTime();
                let myInterval = setInterval(() => {
                    let current = new Date().getTime();
                    if ((current - start) > <number>timeout) {
                        let expectedActivity = <Activity>(typeof expected === 'string' ? { type: ActivityTypes.message, text: expected } : expected);
                        throw new Error(`${timeout}ms Timed out waiting for:${description || expectedActivity.text}`);
                    }

                    // if we have replies
                    if (this.adapter.botReplies.length > 0) {
                        clearInterval(myInterval);
                        let botReply = this.adapter.botReplies[0];
                        this.adapter.botReplies.splice(0, 1);
                        if (typeof expected === 'function') {
                            expected(botReply, description);
                        } else if (typeof expected === 'string') {
                            assert.equal(botReply.type, ActivityTypes.message, (description || '') + ` type === '${botReply.type}'. `);
                            assert.equal(botReply.text, expected, (description || '') + ` text === "${botReply.text}"`);
                        } else {
                            this.validateActivity(botReply, expected);
                        }
                        resolve();
                        return;
                    }
                }, interval);
            })
        }), this.adapter);
    }

    /**
     * throws if the bot's response is not one of the candidate strings
     * @param candidates candidate responses
     * @param description description of test case
     * @param timeout (default 3000ms) time to wait for response from bot
     */
    public assertReplyOneOf(candidates: string[], description?: string, timeout?: number): TestFlow {
        return this.assertReply((activity) => {
            for (let candidate of candidates) {
                if (activity.text == candidate) {
                    return;
                }
            }
            assert.fail(`${description} FAILED, Expected one of :${JSON.stringify(candidates)}`);
        });
    }

    /**
     * Insert delay before continuing
     * @param ms ms to wait
     */
    public delay(ms: number): TestFlow {
        return new TestFlow(this.previous.then(() => {
            return new Promise<void>((resolve, reject) => { setTimeout(() => resolve(), ms); })
        }), this.adapter);
    }

    private validateActivity(activity: Partial<Activity>, expected: Partial<Activity>): void {
        for (let prop in expected) {
            assert.equal((<any>activity)[prop], (<any>expected)[prop]);
        }
    }

    public then(onFulfilled?: () => void): TestFlow {
        return new TestFlow(this.previous.then(onFulfilled), this.adapter);
    }

    public catch(onRejected?: (reason: any) => void): TestFlow {
        return new TestFlow(this.previous.catch(onRejected), this.adapter);
    }
}
