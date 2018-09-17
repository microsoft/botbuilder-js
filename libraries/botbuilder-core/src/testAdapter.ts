/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
// tslint:disable-next-line:no-require-imports
import assert = require('assert');
import { Activity, ActivityTypes, ConversationReference, ResourceResponse } from 'botframework-schema';
import { BotAdapter } from './botAdapter';
import { TurnContext } from './turnContext';

/**
 * Signature for a function that can be used to inspect individual activities returned by a bot
 * that's being tested using the `TestAdapter`.
 *
 * ```TypeScript
 * type TestActivityInspector = (activity: Partial<Activity>, description: string) => void;
 * ```
 */
export type TestActivityInspector = (activity: Partial<Activity>, description: string) => void;

/**
 * Test adapter used for unit tests. This adapter can be used to simulate sending messages from the
 * user to the bot.
 *
 * @remarks
 * The following example sets up the test adapter and then executes a simple test:
 *
 * ```JavaScript
 * const { TestAdapter } = require('botbuilder');
 *
 * const adapter = new TestAdapter(async (context) => {
 *      await context.sendActivity(`Hello World`);
 * });
 *
 * adapter.test(`hi`, `Hello World`)
 *        .then(() => done());
 * ```
 */
export class TestAdapter extends BotAdapter {
    /**
     * @private
     * INTERNAL: used to drive the promise chain forward when running tests.
     */
    public readonly activityBuffer: Partial<Activity>[] = [];

    /**
     * `Activity` template that will be merged with all activities sent to the logic under test.
     */
    public readonly template: Partial<Activity>;

    /**
     * List of updated activities passed to the adapter which can be inspected after the current
     * turn completes.
     *
     * @remarks
     * This example shows how to test that expected updates have been preformed:
     *
     * ```JavaScript
     * adapter.test('update', '1 updated').then(() => {
     *    assert(adapter.updatedActivities.length === 1);
     *    assert(adapter.updatedActivities[0].id === '12345');
     *    done();
     * });
     * ```
     */
    public readonly updatedActivities: Partial<Activity>[] = [];

    /**
     * List of deleted activities passed to the adapter which can be inspected after the current
     * turn completes.
     *
     * @remarks
     * This example shows how to test that expected deletes have been preformed:
     *
     * ```JavaScript
     * adapter.test('delete', '1 deleted').then(() => {
     *    assert(adapter.deletedActivities.length === 1);
     *    assert(adapter.deletedActivities[0].activityId === '12345');
     *    done();
     * });
     * ```
     */
    public readonly deletedActivities: Partial<ConversationReference>[] = [];

    private sendTraceActivities: boolean = false;
    private nextId: number = 0;

    /**
     * Creates a new TestAdapter instance.
     * @param logic The bots logic that's under test.
     * @param template (Optional) activity containing default values to assign to all test messages received.
     */
    constructor(private logic: (context: TurnContext) => Promise<void>, template?: Partial<Activity>, sendTraceActivities?: boolean) {
        super();
        this.sendTraceActivities = sendTraceActivities || false;
        this.template = {
            channelId: 'test',
            serviceUrl: 'https://test.com',
            from: { id: 'user', name: 'User1' },
            recipient: { id: 'bot', name: 'Bot' },
            conversation: { id: 'Convo1' },
            ...template
        } as Partial<Activity>;
    }

    /**
     * @private
     * INTERNAL: called by the logic under test to send a set of activities. These will be buffered
     * to the current `TestFlow` instance for comparison against the expected results.
     * @param context Context object for the current turn of conversation with the user.
     * @param activities Set of activities sent by logic under test.
     */
    public sendActivities(context: TurnContext, activities: Partial<Activity>[]): Promise<ResourceResponse[]> {
        const responses: ResourceResponse[] = activities
            .filter((a: Partial<Activity>) => this.sendTraceActivities || a.type !== 'trace')
            .map((activity: Partial<Activity>) => {
                this.activityBuffer.push(activity);

                return { id: (this.nextId++).toString() };
            });

        return Promise.resolve(responses);
    }

    /**
     * @private
     * INTERNAL: called by the logic under test to replace an existing activity. These are simply
     * pushed onto an [updatedActivities](#updatedactivities) array for inspection after the turn
     * completes.
     * @param context Context object for the current turn of conversation with the user.
     * @param activity Activity being updated.
     */
    public updateActivity(context: TurnContext, activity: Partial<Activity>): Promise<void> {
        this.updatedActivities.push(activity);

        return Promise.resolve();
    }

    /**
     * @private
     * INTERNAL: called by the logic under test to delete an existing activity. These are simply
     * pushed onto a [deletedActivities](#deletedactivities) array for inspection after the turn
     * completes.
     * @param context Context object for the current turn of conversation with the user.
     * @param reference `ConversationReference` for activity being deleted.
     */
    public deleteActivity(context: TurnContext, reference: Partial<ConversationReference>): Promise<void> {
        this.deletedActivities.push(reference);

        return Promise.resolve();
    }

    /**
     * The `TestAdapter` doesn't implement `continueConversation()` and will return an error if it's
     * called.
     */
    public continueConversation(
        reference: Partial<ConversationReference>,
        logic: (revocableContext: TurnContext) => Promise<void>
    ): Promise<void> {
        return Promise.reject(new Error(`not implemented`));
    }

    /**
     * @private
     * INTERNAL: called by a `TestFlow` instance to simulate a user sending a message to the bot.
     * This will cause the adapters middleware pipe to be run and it's logic to be called.
     * @param activity Text or activity from user. The current conversation reference [template](#template) will be merged the passed in activity to properly address the activity. Fields specified in the activity override fields in the template.
     */
    public receiveActivity(activity: string | Partial<Activity>): Promise<void> {
        // Initialize request
        // tslint:disable-next-line:prefer-object-spread
        const request: any = Object.assign(
            {},
            this.template,
            typeof activity === 'string' ? { type: ActivityTypes.Message, text: activity } : activity
        );
        if (!request.type) { request.type = ActivityTypes.Message; }
        if (!request.id) { request.id = (this.nextId++).toString(); }

        // Create context object and run middleware
        const context: TurnContext = new TurnContext(this, request);

        return this.runMiddleware(context, this.logic);
    }

    /**
     * Sends something to the bot. This returns a new `TestFlow` instance which can be used to add
     * additional steps for inspecting the bots reply and then sending additional activities.
     *
     * @remarks
     * This example shows how to send a message and then verify that the response was as expected:
     *
     * ```JavaScript
     * adapter.send('hi')
     *        .assertReply('Hello World')
     *        .then(() => done());
     * ```
     * @param userSays Text or activity simulating user input.
     */
    public send(userSays: string | Partial<Activity>): TestFlow {
        return new TestFlow(this.receiveActivity(userSays), this);
    }

    /**
     * Send something to the bot and expects the bot to return with a given reply.
     *
     * @remarks
     * This is simply a wrapper around calls to `send()` and `assertReply()`. This is such a
     * common pattern that a helper is provided.
     *
     * ```JavaScript
     * adapter.test('hi', 'Hello World')
     *        .then(() => done());
     * ```
     * @param userSays Text or activity simulating user input.
     * @param expected Expected text or activity of the reply sent by the bot.
     * @param description (Optional) Description of the test case. If not provided one will be generated.
     * @param timeout (Optional) number of milliseconds to wait for a response from bot. Defaults to a value of `3000`.
     */
    public test(
        userSays: string | Partial<Activity>,
        expected: string | Partial<Activity> | ((activity: Partial<Activity>, description?: string) => void),
        description?: string,
        timeout?: number
    ): TestFlow {
        return this.send(userSays)
            .assertReply(expected, description);
    }

    /**
     * Test a list of activities.
     * Each activity with the "bot" role will be processed with assertReply()
     * Every other activity will be processed as a user message with send()
     * @param activities Array of activities.
     * @param description (Optional) Description of the test case. If not provided one will be generated.
     * @param timeout (Optional) number of milliseconds to wait for a response from bot. Defaults to a value of `3000`.
     */
    public testActivities(activities: Partial<Activity>[], description?: string, timeout?: number): TestFlow {
        if (!activities) {
            throw new Error('Missing array of activities');
        }

        const activityInspector: any = (expected: Partial<Activity>): TestActivityInspector =>
            (actual: Partial<Activity>, description2: string): any =>
                validateTranscriptActivity(actual, expected, description2);

        // Chain all activities in a TestFlow, check if its a user message (send) or a bot reply (assert)
        return activities.reduce(
            (flow: TestFlow, activity: Partial<Activity>) => {
                // tslint:disable-next-line:prefer-template
                const assertDescription: string = `reply ${(description ? ' from ' + description : '')}`;

                return this.isReply(activity)
                    ? flow.assertReply(activityInspector(activity, description), assertDescription, timeout)
                    : flow.send(activity);
            },
            new TestFlow(Promise.resolve(), this));
    }

    /**
     * Indicates if the activity is a reply from the bot (role == 'bot')
     *
     * @remarks
     * Checks to see if the from property and if from.role exists on the Activity before
     * checking to see who the activity is from. Otherwise returns false by default.
     * @param activity Activity to check.
     */
    private isReply(activity: Partial<Activity>): boolean {
        if (activity.from && activity.from.role) {
            return activity.from.role && activity.from.role.toLocaleLowerCase() === 'bot';
        } else {
            return false;
        }
    }
}

/**
 * Support class for `TestAdapter` that allows for the simple construction of a sequence of tests.
 *
 * @remarks
 * Calling `adapter.send()` or `adapter.test()` will create a new test flow which you can chain
 * together additional tests using a fluent syntax.
 *
 * ```JavaScript
 * const { TestAdapter } = require('botbuilder');
 *
 * const adapter = new TestAdapter(async (context) => {
 *    if (context.text === 'hi') {
 *       await context.sendActivity(`Hello World`);
 *    } else if (context.text === 'bye') {
 *       await context.sendActivity(`Goodbye`);
 *    }
 * });
 *
 * adapter.test(`hi`, `Hello World`)
 *        .test(`bye`, `Goodbye`)
 *        .then(() => done());
 * ```
 */
export class TestFlow {

    /**
     * @private
     * INTERNAL: creates a new TestFlow instance.
     * @param previous Promise chain for the current test sequence.
     * @param adapter Adapter under tested.
     */
    constructor(public previous: Promise<void>, private adapter: TestAdapter) { }

    /**
     * Send something to the bot and expects the bot to return with a given reply. This is simply a
     * wrapper around calls to `send()` and `assertReply()`. This is such a common pattern that a
     * helper is provided.
     * @param userSays Text or activity simulating user input.
     * @param expected Expected text or activity of the reply sent by the bot.
     * @param description (Optional) Description of the test case. If not provided one will be generated.
     * @param timeout (Optional) number of milliseconds to wait for a response from bot. Defaults to a value of `3000`.
     */
    public test(
        userSays: string | Partial<Activity>,
        expected: string | Partial<Activity> | ((activity: Partial<Activity>, description?: string) => void),
        description?: string,
        timeout?: number
    ): TestFlow {
        return this.send(userSays)
            .assertReply(expected, description || `test("${userSays}", "${expected}")`, timeout);
    }

    /**
     * Sends something to the bot.
     * @param userSays Text or activity simulating user input.
     */
    public send(userSays: string | Partial<Activity>): TestFlow {
        return new TestFlow(this.previous.then(() => this.adapter.receiveActivity(userSays)), this.adapter);
    }

    /**
     * Generates an assertion if the bots response doesn't match the expected text/activity.
     * @param expected Expected text or activity from the bot. Can be a callback to inspect the response using custom logic.
     * @param description (Optional) Description of the test case. If not provided one will be generated.
     * @param timeout (Optional) number of milliseconds to wait for a response from bot. Defaults to a value of `3000`.
     */
    public assertReply(expected: string | Partial<Activity> | TestActivityInspector, description?: string, timeout?: number): TestFlow {
        function defaultInspector(reply: Partial<Activity>, description2?: string): void {
            if (typeof expected === 'object') {
                validateActivity(reply, expected);
            } else {
                assert.equal(reply.type, ActivityTypes.Message, `${description2} type === '${reply.type}'. `);
                assert.equal(reply.text, expected, `${description2} text === "${reply.text}"`);
            }
        }

        if (!description) { description = ''; }
        const inspector: TestActivityInspector = typeof expected === 'function' ? expected : defaultInspector;

        return new TestFlow(
            this.previous.then(() => {
                // tslint:disable-next-line:promise-must-complete
                return new Promise<void>((resolve: any, reject: any): void => {
                    if (!timeout) { timeout = 3000; }
                    const start: number = new Date().getTime();
                    const adapter: TestAdapter = this.adapter;

                    function waitForActivity(): void {
                        const current: number = new Date().getTime();
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
                            reject(
                                new Error(`TestAdapter.assertReply(${expecting}): ${description} Timed out after ${current - start}ms.`)
                            );
                        } else if (adapter.activityBuffer.length > 0) {
                            // Activity received
                            const reply: Partial<Activity> = adapter.activityBuffer.shift() as Activity;
                            try {
                                inspector(reply, description as string);
                            } catch (err) {
                                reject(err);
                            }
                            resolve();
                        } else {
                            setTimeout(waitForActivity, 5);
                        }
                    }
                    waitForActivity();
                });
            }),
            this.adapter);
    }

    /**
     * Generates an assertion if the bots response is not one of the candidate strings.
     * @param candidates List of candidate responses.
     * @param description (Optional) Description of the test case. If not provided one will be generated.
     * @param timeout (Optional) number of milliseconds to wait for a response from bot. Defaults to a value of `3000`.
     */
    public assertReplyOneOf(candidates: string[], description?: string, timeout?: number): TestFlow {
        return this.assertReply(
            (activity: Partial<Activity>, description2: string) => {
                for (const candidate of candidates) {
                    if (activity.text === candidate) {
                        return;
                    }
                }
                assert.fail(`TestAdapter.assertReplyOneOf(): ${description2 || ''} FAILED, Expected one of :${JSON.stringify(candidates)}`);
            },
            description,
            timeout
        );
    }

    /**
     * Inserts a delay before continuing.
     * @param ms ms to wait
     */
    public delay(ms: number): TestFlow {
        return new TestFlow(
            this.previous.then(() => {
                return new Promise<void>((resolve: any, reject: any): void => { setTimeout(resolve, ms); });
            }),
            this.adapter
        );
    }

    /**
     * Adds a `then()` step to the tests promise chain.
     * @param onFulfilled Code to run if the test is currently passing.
     */
    public then(onFulfilled?: () => void): TestFlow {
        return new TestFlow(this.previous.then(onFulfilled), this.adapter);
    }

    /**
     * Adds a `catch()` clause to the tests promise chain.
     * @param onRejected Code to run if the test has thrown an error.
     */
    public catch(onRejected?: (reason: any) => void): TestFlow {
        return new TestFlow(this.previous.catch(onRejected), this.adapter);
    }

    /**
     * start the test sequence, returning a promise to await
     */
    public startTest() : Promise<void> {
        return this.previous;
    }
}

/**
 * @private
 * @param activity an activity object to validate
 * @param expected expected object to validate against
 */
function validateActivity(activity: Partial<Activity>, expected: Partial<Activity>): void {
    // tslint:disable-next-line:forin
    Object.keys(expected).forEach((prop: any) => {
        assert.equal((<any>activity)[prop], (<any>expected)[prop]);
    });
}

/**
 * @private
 * Does a shallow comparison of:
 * - type
 * - text
 * - speak
 * - suggestedActions
 *
 * @param activity
 * @param expected
 * @param description
 */
function validateTranscriptActivity(activity: Partial<Activity>, expected: Partial<Activity>, description: string): void {
    assert.equal(activity.type, expected.type, `failed "type" assert on ${description}`);
    assert.equal(activity.text, expected.text, `failed "text" assert on ${description}`);
    assert.equal(activity.speak, expected.speak, `failed "speak" assert on ${description}`);
    assert.deepEqual(activity.suggestedActions, expected.suggestedActions, `failed "suggestedActions" assert on ${description}`);
}
