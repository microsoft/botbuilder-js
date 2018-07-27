"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const botAdapter_1 = require("./botAdapter");
const turnContext_1 = require("./turnContext");
const botframework_schema_1 = require("botframework-schema");
const assert = require("assert");
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
class TestAdapter extends botAdapter_1.BotAdapter {
    /**
     * Creates a new TestAdapter instance.
     * @param logic The bots logic that's under test.
     * @param template (Optional) activity containing default values to assign to all test messages received.
     */
    constructor(logic, template, sendTraceActivities) {
        super();
        this.logic = logic;
        /**
         * @private
         * INTERNAL: used to drive the promise chain forward when running tests.
         */
        this.activityBuffer = [];
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
        this.updatedActivities = [];
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
        this.deletedActivities = [];
        this.sendTraceActivities = false;
        this.nextId = 0;
        this.sendTraceActivities = sendTraceActivities || false;
        this.template = Object.assign({
            channelId: 'test',
            serviceUrl: 'https://test.com',
            from: { id: 'user', name: 'User1' },
            recipient: { id: 'bot', name: 'Bot' },
            conversation: { id: 'Convo1' },
        }, template);
    }
    /**
     * @private
     * INTERNAL: called by the logic under test to send a set of activities. These will be buffered
     * to the current `TestFlow` instance for comparison against the expected results.
     * @param context Context object for the current turn of conversation with the user.
     * @param activities Set of activities sent by logic under test.
     */
    sendActivities(context, activities) {
        const responses = activities
            .filter(a => this.sendTraceActivities || a.type !== 'trace')
            .map((activity) => {
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
    updateActivity(context, activity) {
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
    deleteActivity(context, reference) {
        this.deletedActivities.push(reference);
        return Promise.resolve();
    }
    /**
     * The `TestAdapter` doesn't implement `continueConversation()` and will return an error if it's
     * called.
     */
    continueConversation(reference, logic) {
        return Promise.reject(new Error(`not implemented`));
    }
    /**
     * @private
     * INTERNAL: called by a `TestFlow` instance to simulate a user sending a message to the bot.
     * This will cause the adapters middleware pipe to be run and it's logic to be called.
     * @param activity Text or activity from user. The current conversation reference [template](#template) will be merged the passed in activity to properly address the activity. Fields specified in the activity override fields in the template.
     */
    receiveActivity(activity) {
        // Initialize request
        const request = Object.assign({}, this.template, typeof activity === 'string' ? { type: botframework_schema_1.ActivityTypes.Message, text: activity } : activity);
        if (!request.type) {
            request.type = botframework_schema_1.ActivityTypes.Message;
        }
        if (!request.id) {
            request.id = (this.nextId++).toString();
        }
        // Create context object and run middleware
        const context = new turnContext_1.TurnContext(this, request);
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
    send(userSays) {
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
    test(userSays, expected, description, timeout) {
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
    testActivities(activities, description, timeout) {
        if (!activities) {
            throw new Error('Missing array of activities');
        }
        const activityInspector = (expected) => (actual, description) => validateTranscriptActivity(actual, expected, description);
        // Chain all activities in a TestFlow, check if its a user message (send) or a bot reply (assert)
        return activities.reduce((flow, activity) => {
            let assertDescription = 'reply' + (description ? ' from ' + description : '');
            return this.isReply(activity)
                ? flow.assertReply(activityInspector(activity), assertDescription, timeout)
                : flow.send(activity);
        }, new TestFlow(Promise.resolve(), this));
    }
    /**
     * Indicates if the activity is a reply from the bot (role == 'bot')
     * @param activity Activity to check.
     */
    isReply(activity) {
        return activity.from.role && activity.from.role.toLocaleLowerCase() === 'bot';
    }
}
exports.TestAdapter = TestAdapter;
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
class TestFlow {
    /**
     * @private
     * INTERNAL: creates a new TestFlow instance.
     * @param previous Promise chain for the current test sequence.
     * @param adapter Adapter under tested.
     */
    constructor(previous, adapter) {
        this.previous = previous;
        this.adapter = adapter;
    }
    /**
     * Send something to the bot and expects the bot to return with a given reply. This is simply a
     * wrapper around calls to `send()` and `assertReply()`. This is such a common pattern that a
     * helper is provided.
     * @param userSays Text or activity simulating user input.
     * @param expected Expected text or activity of the reply sent by the bot.
     * @param description (Optional) Description of the test case. If not provided one will be generated.
     * @param timeout (Optional) number of milliseconds to wait for a response from bot. Defaults to a value of `3000`.
     */
    test(userSays, expected, description, timeout) {
        return this.send(userSays)
            .assertReply(expected, description || `test("${userSays}", "${expected}")`, timeout);
    }
    /**
     * Sends something to the bot.
     * @param userSays Text or activity simulating user input.
     */
    send(userSays) {
        return new TestFlow(this.previous.then(() => this.adapter.receiveActivity(userSays)), this.adapter);
    }
    /**
     * Generates an assertion if the bots response doesn't match the expected text/activity.
     * @param expected Expected text or activity from the bot. Can be a callback to inspect the response using custom logic.
     * @param description (Optional) Description of the test case. If not provided one will be generated.
     * @param timeout (Optional) number of milliseconds to wait for a response from bot. Defaults to a value of `3000`.
     */
    assertReply(expected, description, timeout) {
        function defaultInspector(reply, description) {
            if (typeof expected === 'object') {
                validateActivity(reply, expected);
            }
            else {
                assert.equal(reply.type, botframework_schema_1.ActivityTypes.Message, description + ` type === '${reply.type}'. `);
                assert.equal(reply.text, expected, description + ` text === "${reply.text}"`);
            }
        }
        if (!description) {
            description = '';
        }
        const inspector = typeof expected === 'function' ? expected : defaultInspector;
        return new TestFlow(this.previous.then(() => {
            return new Promise((resolve, reject) => {
                if (!timeout) {
                    timeout = 3000;
                }
                let start = new Date().getTime();
                const adapter = this.adapter;
                function waitForActivity() {
                    let current = new Date().getTime();
                    if ((current - start) > timeout) {
                        // Operation timed out
                        let expecting;
                        switch (typeof expected) {
                            case 'string':
                            default:
                                expecting = `"${expected.toString()}"`;
                                break;
                            case 'object':
                                expecting = `"${expected.text}`;
                                break;
                            case 'function':
                                expecting = expected.toString();
                                break;
                        }
                        reject(new Error(`TestAdapter.assertReply(${expecting}): ${description} Timed out after ${current - start}ms.`));
                    }
                    else if (adapter.activityBuffer.length > 0) {
                        // Activity received
                        const reply = adapter.activityBuffer.shift();
                        inspector(reply, description);
                        resolve();
                    }
                    else {
                        setTimeout(() => waitForActivity(), 5);
                    }
                }
                waitForActivity();
            });
        }), this.adapter);
    }
    /**
     * Generates an assertion if the bots response is not one of the candidate strings.
     * @param candidates List of candidate responses.
     * @param description (Optional) Description of the test case. If not provided one will be generated.
     * @param timeout (Optional) number of milliseconds to wait for a response from bot. Defaults to a value of `3000`.
     */
    assertReplyOneOf(candidates, description, timeout) {
        return this.assertReply((activity, description) => {
            for (const candidate of candidates) {
                if (activity.text === candidate) {
                    return;
                }
            }
            assert.fail(`TestAdapter.assertReplyOneOf(): ${description || ''} FAILED, Expected one of :${JSON.stringify(candidates)}`);
        }, description, timeout);
    }
    /**
     * Inserts a delay before continuing.
     * @param ms ms to wait
     */
    delay(ms) {
        return new TestFlow(this.previous.then(() => {
            return new Promise((resolve, reject) => { setTimeout(() => resolve(), ms); });
        }), this.adapter);
    }
    /**
     * Adds a `then()` step to the tests promise chain.
     * @param onFulfilled Code to run if the test is currently passing.
     */
    then(onFulfilled) {
        return new TestFlow(this.previous.then(onFulfilled), this.adapter);
    }
    /**
     * Adds a `catch()` clause to the tests promise chain.
     * @param onRejected Code to run if the test has thrown an error.
     */
    catch(onRejected) {
        return new TestFlow(this.previous.catch(onRejected), this.adapter);
    }
}
exports.TestFlow = TestFlow;
/**
 * @private
 * @param activity
 * @param expected
 */
function validateActivity(activity, expected) {
    for (const prop in expected) {
        assert.equal(activity[prop], expected[prop]);
    }
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
function validateTranscriptActivity(activity, expected, description) {
    assert.equal(activity.type, expected.type, 'failed "type" assert on ' + description);
    assert.equal(activity.text, expected.text, 'failed "text" assert on ' + description);
    assert.equal(activity.speak, expected.speak, 'failed "speak" assert on ' + description);
    assert.deepEqual(activity.suggestedActions, expected.suggestedActions, 'failed "suggestedActions" assert on ' + description);
}
//# sourceMappingURL=testAdapter.js.map