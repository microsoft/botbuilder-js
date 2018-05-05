/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BotAdapter, Activity, ConversationReference, Promiseable, TurnContext, ResourceResponse } from 'botbuilder-core';
/**
 * Signature for a function that can be used to inspect individual activities returned by a bot
 * that's being tested using the `TestAdapter`.
 *
 * ```TypeScript
 * type TestActivityInspector = (activity: Partial<Activity>, description: string) => void;
 * ```
 */
export declare type TestActivityInspector = (activity: Partial<Activity>, description: string) => void;
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
export declare class TestAdapter extends BotAdapter {
    private logic;
    private nextId;
    /**
     * @private
     * INTERNAL: used to drive the promise chain forward when running tests.
     */
    readonly activityBuffer: Partial<Activity>[];
    /**
     * `ConversationReference` template that will be merged with all activities sent to the logic
     * under test.
     */
    readonly template: Partial<Activity>;
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
    readonly updatedActivities: Partial<Activity>[];
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
    readonly deletedActivities: Partial<ConversationReference>[];
    /**
     * Creates a new TestAdapter instance.
     * @param logic The bots logic that's under test.
     * @param template (Optional) activity containing default values to assign to all test messages received.
     */
    constructor(logic: (context: TurnContext) => Promiseable<void>, template?: ConversationReference);
    /**
     * @private
     * INTERNAL: called by the logic under test to send a set of activities. These will be buffered
     * to the current `TestFlow` instance for comparison against the expected results.
     * @param context Context object for the current turn of conversation with the user.
     * @param activities Set of activities sent by logic under test.
     */
    sendActivities(context: TurnContext, activities: Partial<Activity>[]): Promise<ResourceResponse[]>;
    /**
     * @private
     * INTERNAL: called by the logic under test to replace an existing activity. These are simply
     * pushed onto an [updatedActivities](#updatedactivities) array for inspection after the turn
     * completes.
     * @param context Context object for the current turn of conversation with the user.
     * @param activity Activity being updated.
     */
    updateActivity(context: TurnContext, activity: Partial<Activity>): Promise<void>;
    /**
     * @private
     * INTERNAL: called by the logic under test to delete an existing activity. These are simply
     * pushed onto a [deletedActivities](#deletedactivities) array for inspection after the turn
     * completes.
     * @param context Context object for the current turn of conversation with the user.
     * @param reference `ConversationReference` for activity being deleted.
     */
    deleteActivity(context: TurnContext, reference: Partial<ConversationReference>): Promise<void>;
    /**
     * The `TestAdapter` doesn't implement `continueConversation()` and will return an error if it's
     * called.
     */
    continueConversation(reference: Partial<ConversationReference>, logic: (revocableContext: TurnContext) => Promiseable<void>): Promise<void>;
    /**
     * @private
     * INTERNAL: called by a `TestFlow` instance to simulate a user sending a message to the bot.
     * This will cause the adapters middleware pipe to be run and it's logic to be called.
     * @param activity Text or activity from user. The current conversation reference [template](#template) will be merged the passed in activity to properly address the activity. Fields specified in the activity override fields in the template.
     */
    receiveActivity(activity: string | Partial<Activity>): Promise<void>;
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
    send(userSays: string | Partial<Activity>): TestFlow;
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
    test(userSays: string | Partial<Activity>, expected: string | Partial<Activity> | ((activity: Partial<Activity>, description?: string) => void), description?: string, timeout?: number): TestFlow;
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
export declare class TestFlow {
    previous: Promise<void>;
    private adapter;
    /**
     * @private
     * INTERNAL: creates a new TestFlow instance.
     * @param previous Promise chain for the current test sequence.
     * @param adapter Adapter under tested.
     */
    constructor(previous: Promise<void>, adapter: TestAdapter);
    /**
     * Send something to the bot and expects the bot to return with a given reply. This is simply a
     * wrapper around calls to `send()` and `assertReply()`. This is such a common pattern that a
     * helper is provided.
     * @param userSays Text or activity simulating user input.
     * @param expected Expected text or activity of the reply sent by the bot.
     * @param description (Optional) Description of the test case. If not provided one will be generated.
     * @param timeout (Optional) number of milliseconds to wait for a response from bot. Defaults to a value of `3000`.
     */
    test(userSays: string | Partial<Activity>, expected: string | Partial<Activity> | ((activity: Partial<Activity>, description?: string) => void), description?: string, timeout?: number): TestFlow;
    /**
     * Sends something to the bot.
     * @param userSays Text or activity simulating user input.
     */
    send(userSays: string | Partial<Activity>): TestFlow;
    /**
     * Generates an assertion if the bots response doesn't match the expected text/activity.
     * @param expected Expected text or activity from the bot. Can be a callback to inspect the response using custom logic.
     * @param description (Optional) Description of the test case. If not provided one will be generated.
     * @param timeout (Optional) number of milliseconds to wait for a response from bot. Defaults to a value of `3000`.
     */
    assertReply(expected: string | Partial<Activity> | TestActivityInspector, description?: string, timeout?: number): TestFlow;
    /**
     * Generates an assertion if the bots response is not one of the candidate strings.
     * @param candidates List of candidate responses.
     * @param description (Optional) Description of the test case. If not provided one will be generated.
     * @param timeout (Optional) number of milliseconds to wait for a response from bot. Defaults to a value of `3000`.
     */
    assertReplyOneOf(candidates: string[], description?: string, timeout?: number): TestFlow;
    /**
     * Inserts a delay before continuing.
     * @param ms ms to wait
     */
    delay(ms: number): TestFlow;
    /**
     * Adds a `then()` step to the tests promise chain.
     * @param onFulfilled Code to run if the test is currently passing.
     */
    then(onFulfilled?: () => void): TestFlow;
    /**
     * Adds a `catch()` clause to the tests promise chain.
     * @param onRejected Code to run if the test has thrown an error.
     */
    catch(onRejected?: (reason: any) => void): TestFlow;
}
