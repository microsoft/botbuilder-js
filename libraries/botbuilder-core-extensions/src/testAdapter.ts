/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { 
    BotAdapter, ActivityTypes, Activity, ConversationReference, ChannelAccount,
    Promiseable, BotContext, ResourceResponse 
} from 'botbuilder-core';
import assert = require('assert');


/**
 * Test adapter used for unit tests.
 */
export class TestAdapter extends BotAdapter {
    private nextId = 0;

    /** INTERNAL: used to drive the promise chain forward when running tests. */
    public readonly activityBuffer: Partial<Activity>[] = [];
   
    public readonly template: Partial<Activity>;
    public readonly updatedActivities: Partial<Activity>[] = [];
    public readonly deletedActivities: string[] = [];

    /**
     * Creates a new instance of the test adapter.
     * @param botLogic The bots logic that's under test.
     * @param template (Optional) activity containing default values to assign to all test messages received.
     */
    constructor(private botLogic: (context: BotContext<TestAdapter>) => Promiseable<void>, template?: ConversationReference) {
        super();
        this.template = Object.assign({
            channelId: 'test',
            serviceUrl: 'https://test.com',
            from: { id: 'user', name: 'User1' },
            recipient: { id: 'bot', name: 'Bot' },
            conversation: { id: 'Convo1' }
        } as Activity, template);
    }

    public sendActivities(activities: Partial<Activity>[]): Promise<ResourceResponse[]> {
        const responses = activities.map((activity) => {  
            this.activityBuffer.push(activity);
            return { id: (this.nextId++).toString() };
        });
        return Promise.resolve(responses);
    }

    public updateActivity(activity: Partial<Activity>): Promise<void> {
        this.updatedActivities.push(activity);
        return Promise.resolve();
    }

    public deleteActivity(id: string): Promise<void> {
        this.deletedActivities.push(id);
        return Promise.resolve();
    }

    /**
     * Processes and activity received from the user.
     * @param activity Text or activity from user.
     */
    public receiveActivity(activity: string | Partial<Activity>): Promise<void> {
        // Initialize request
        const request = Object.assign({}, this.template, typeof activity === 'string' ? { type: ActivityTypes.Message, text: activity } : activity);
        if (!request.type) { request.type = ActivityTypes.Message }
        if (!request.id) { request.id = (this.nextId++).toString() }

        // Create context object and run middleware
        const context = new BotContext<TestAdapter>(this, request);
        return this.runMiddleware(context, this.botLogic);
    }


    /**
     * Send something to the bot
     * @param userSays text or activity simulating user input
     */
    public send(userSays: string | Partial<Activity>): TestFlow {
        return new TestFlow(this.receiveActivity(userSays), this);
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
    public test(userSays: string | Partial<Activity>, expected: string | Partial<Activity> | ((activity: Partial<Activity>, description?: string) => void), description?: string, timeout?: number): TestFlow {
        return this.send(userSays)
            .assertReply(expected, description);
    }

    /**
     * Throws if the bot's response doesn't match the expected text/activity
     * @param expected expected text or activity from the bot
     * @param description description of test case
     * @param timeout (default 3000ms) time to wait for response from bot
     */
    public assertReply(expected: string | Partial<Activity> | ((activity: Partial<Activity>, description?: string) => void), description?: string, timeout?: number): TestFlow {
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
    public test(userSays: string | Partial<Activity>, expected: string | Partial<Activity> | ((activity: Partial<Activity>, description?: string) => void), description?: string, timeout?: number): TestFlow {
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
        return new TestFlow(this.previous.then(() => this.adapter.receiveActivity(userSays)), this.adapter);
    }

    /**
     * Throws if the bot's response doesn't match the expected text/activity
     * @param expected expected text or activity from the bot, or callback to inspect object
     * @param description description of test case
     * @param timeout (default 3000ms) time to wait for response from bot
     */
    public assertReply(expected: string | Partial<Activity> | ((activity: Partial<Activity>, description?: string) => void), description?: string, timeout?: number): TestFlow {
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
                        let expectedActivity = <Activity>(typeof expected === 'string' ? { type: ActivityTypes.Message, text: expected } : expected);
                        throw new Error(`${timeout}ms Timed out waiting for:${description || expectedActivity.text}`);
                    }

                    // if we have replies
                    if (this.adapter.activityBuffer.length > 0) {
                        clearInterval(myInterval);
                        let botReply = this.adapter.activityBuffer[0];
                        this.adapter.activityBuffer.splice(0, 1);
                        if (typeof expected === 'function') {
                            expected(botReply, description);
                        } else if (typeof expected === 'string') {
                            assert.equal(botReply.type, ActivityTypes.Message, (description || '') + ` type === '${botReply.type}'. `);
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
