/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { 
    BotAdapter, ActivityTypes, Activity, ConversationReference, ChannelAccount,
    Promiseable, TurnContext, ResourceResponse 
} from 'botbuilder-core';
import assert = require('assert');

/** 
 * :package: **botbuilder-core-extensions**
 * 
 * 
 */
export type TestActivityInspector = (activity: Partial<Activity>, description: string) => void;

/**
 * :package: **botbuilder-core-extensions**
 * 
 * Test adapter used for unit tests.
 */
export class TestAdapter extends BotAdapter {
    private nextId = 0;

    /** INTERNAL: used to drive the promise chain forward when running tests. */
    public readonly activityBuffer: Partial<Activity>[] = [];
   
    public readonly template: Partial<Activity>;
    public readonly updatedActivities: Partial<Activity>[] = [];
    public readonly deletedActivities: Partial<ConversationReference>[] = [];

    /**
     * Creates a new instance of the test adapter.
     * @param botLogic The bots logic that's under test.
     * @param template (Optional) activity containing default values to assign to all test messages received.
     */
    constructor(private botLogic: (context: TurnContext) => Promiseable<void>, template?: ConversationReference) {
        super();
        this.template = Object.assign({
            channelId: 'test',
            serviceUrl: 'https://test.com',
            from: { id: 'user', name: 'User1' },
            recipient: { id: 'bot', name: 'Bot' },
            conversation: { id: 'Convo1' }
        } as Activity, template);
    }

    public sendActivities(context: TurnContext, activities: Partial<Activity>[]): Promise<ResourceResponse[]> {
        const responses = activities.map((activity) => {  
            this.activityBuffer.push(activity);
            return { id: (this.nextId++).toString() };
        });
        return Promise.resolve(responses);
    }

    public updateActivity(context: TurnContext, activity: Partial<Activity>): Promise<void> {
        this.updatedActivities.push(activity);
        return Promise.resolve();
    }

    public deleteActivity(context: TurnContext, reference: Partial<ConversationReference>): Promise<void> {
        this.deletedActivities.push(reference);
        return Promise.resolve();
    }

    public continueConversation(reference: Partial<ConversationReference>, logic: (revocableContext: TurnContext) => Promiseable<void>): Promise<void> {
        return Promise.reject(new Error(`not implemented`));
    }

    /**
     * Processes and activity received from the user.
     * @param activity Text or activity from user.
     */
    public receiveActivity(activity: string|Partial<Activity>): Promise<void> {
        // Initialize request
        const request = Object.assign({}, this.template, typeof activity === 'string' ? { type: ActivityTypes.Message, text: activity } : activity);
        if (!request.type) { request.type = ActivityTypes.Message }
        if (!request.id) { request.id = (this.nextId++).toString() }

        // Create context object and run middleware
        const context = new TurnContext(this, request);
        return this.runMiddleware(context, this.botLogic);
    }


    /**
     * Send something to the bot
     * @param userSays text or activity simulating user input
     */
    public send(userSays: string|Partial<Activity>): TestFlow {
        return new TestFlow(this.receiveActivity(userSays), this);
    }

    /**
     * Send something to the bot and expect the bot to reply
     * @param userSays text or activity simulating user input
     * @param expected expected text or activity from the bot
     * @param description description of test case
     * @param timeout (default 3000ms) time to wait for response from bot
     */
    public test(userSays: string | Partial<Activity>, expected: string | Partial<Activity> | ((activity: Partial<Activity>, description?: string) => void), description?: string, timeout?: number): TestFlow {
        return this.send(userSays)
            .assertReply(expected, description);
    }
}

/**
 * :package: **botbuilder-core-extensions**
 * 
 *  INTERNAL support class for `TestAdapter`. 
 */
export class TestFlow {

    constructor(public previous: Promise<void>, private adapter: TestAdapter) { }

    /**
     * Send something to the bot and expect the bot to reply
     * @param userSays text or activity simulating user input
     * @param expected expected text or activity from the bot
     * @param description description of test case
     * @param timeout (default 3000ms) time to wait for response from bot
     */
    public test(userSays: string|Partial<Activity>, expected: string | Partial<Activity> | ((activity: Partial<Activity>, description?: string) => void), description?: string, timeout?: number): TestFlow {
        return this.send(userSays)
            .assertReply(expected, description || `test("${userSays}", "${expected}")`, timeout);
    }

    /**
     * Send something to the bot
     * @param userSays text or activity simulating user input
     */
    public send(userSays: string | Partial<Activity>): TestFlow {
        return new TestFlow(this.previous.then(() => this.adapter.receiveActivity(userSays)), this.adapter);
    }

    /**
     * Throws if the bot's response doesn't match the expected text/activity
     * @param expected expected text or activity from the bot, or callback to inspect object
     * @param description description of test case
     * @param timeout (default 3000ms) time to wait for response from bot
     */
    public assertReply(expected: string|Partial<Activity>|TestActivityInspector, description?: string, timeout?: number): TestFlow {
        function defaultInspector(reply: Partial<Activity>, description?: string) {
            if (typeof expected === 'object') {
                validateActivity(reply, expected);
            } else {
                assert.equal(reply.type, ActivityTypes.Message,  description + ` type === '${reply.type}'. `);
                assert.equal(reply.text, expected, description + ` text === "${reply.text}"`);
            }
        }

        if (!description) { description = '' }
        const inspector: TestActivityInspector = typeof expected === 'function' ? expected : defaultInspector;
        return new TestFlow(this.previous.then(() => {
            return new Promise<void>((resolve, reject) => {
                if (!timeout) { timeout = 3000 }
                let start = new Date().getTime();
                const adapter = this.adapter;

                function waitForActivity() {
                    let current = new Date().getTime();
                    if ((current - start) > <number>timeout) {
                        // Operation timed out
                        let expecting: string;
                        switch (typeof expected) {
                            case 'string':
                            default:
                                expecting = `"${expected.toString()}"`;
                                break;
                            case 'object':
                                expecting = `"${(expected as Activity).text}`;
                                break;
                            case 'function':
                                expecting = expected.toString();
                                break;
                        }
                        reject(new Error(`TestAdapter.assertReply(${expecting}): ${description} Timed out after ${current - start}ms.`));
                    } else if (adapter.activityBuffer.length > 0) {
                        // Activity received
                        const reply = adapter.activityBuffer.shift() as Activity;
                        inspector(reply, description as string);
                        resolve();
                    } else {
                        setTimeout(() => waitForActivity(), 5);
                    }
                }
                waitForActivity();
            });
        }), this.adapter);
    }

    /**
     * throws if the bot's response is not one of the candidate strings
     * @param candidates candidate responses
     * @param description description of test case
     * @param timeout (default 3000ms) time to wait for response from bot
     */
    public assertReplyOneOf(candidates: string[], description?: string, timeout?: number): TestFlow {
        return this.assertReply((activity, description) => {
            for (const candidate of candidates) {
                if (activity.text == candidate) {
                    return;
                }
            }
            assert.fail(`TestAdapter.assertReplyOneOf(): ${description || ''} FAILED, Expected one of :${JSON.stringify(candidates)}`);
        }, description, timeout);
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
    public then(onFulfilled?: () => void): TestFlow {
        return new TestFlow(this.previous.then(onFulfilled), this.adapter);
    }

    public catch(onRejected?: (reason: any) => void): TestFlow {
        return new TestFlow(this.previous.catch(onRejected), this.adapter);
    }
}

function validateActivity(activity: Partial<Activity>, expected: Partial<Activity>): void {
    for (const prop in expected) {
        assert.equal((<any>activity)[prop], (<any>expected)[prop]);
    }
}
