/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BotAdapter, Activity, ConversationReference, Promiseable, TurnContext, ResourceResponse } from 'botbuilder-core';
/**
 * :package: **botbuilder-core-extensions**
 *
 *
 */
export declare type TestActivityInspector = (activity: Partial<Activity>, description: string) => void;
/**
 * :package: **botbuilder-core-extensions**
 *
 * Test adapter used for unit tests.
 */
export declare class TestAdapter extends BotAdapter {
    private botLogic;
    private nextId;
    /** INTERNAL: used to drive the promise chain forward when running tests. */
    readonly activityBuffer: Partial<Activity>[];
    readonly template: Partial<Activity>;
    readonly updatedActivities: Partial<Activity>[];
    readonly deletedActivities: Partial<ConversationReference>[];
    /**
     * Creates a new instance of the test adapter.
     * @param botLogic The bots logic that's under test.
     * @param template (Optional) activity containing default values to assign to all test messages received.
     */
    constructor(botLogic: (context: TurnContext) => Promiseable<void>, template?: ConversationReference);
    sendActivities(context: TurnContext, activities: Partial<Activity>[]): Promise<ResourceResponse[]>;
    updateActivity(context: TurnContext, activity: Partial<Activity>): Promise<void>;
    deleteActivity(context: TurnContext, reference: Partial<ConversationReference>): Promise<void>;
    continueConversation(reference: Partial<ConversationReference>, logic: (revocableContext: TurnContext) => Promiseable<void>): Promise<void>;
    /**
     * Processes and activity received from the user.
     * @param activity Text or activity from user.
     */
    receiveActivity(activity: string | Partial<Activity>): Promise<void>;
    /**
     * Send something to the bot
     * @param userSays text or activity simulating user input
     */
    send(userSays: string | Partial<Activity>): TestFlow;
    /**
     * Send something to the bot and expect the bot to reply
     * @param userSays text or activity simulating user input
     * @param expected expected text or activity from the bot
     * @param description description of test case
     * @param timeout (default 3000ms) time to wait for response from bot
     */
    test(userSays: string | Partial<Activity>, expected: string | Partial<Activity> | ((activity: Partial<Activity>, description?: string) => void), description?: string, timeout?: number): TestFlow;
}
/**
 * :package: **botbuilder-core-extensions**
 *
 *  INTERNAL support class for `TestAdapter`.
 */
export declare class TestFlow {
    previous: Promise<void>;
    private adapter;
    constructor(previous: Promise<void>, adapter: TestAdapter);
    /**
     * Send something to the bot and expect the bot to reply
     * @param userSays text or activity simulating user input
     * @param expected expected text or activity from the bot
     * @param description description of test case
     * @param timeout (default 3000ms) time to wait for response from bot
     */
    test(userSays: string | Partial<Activity>, expected: string | Partial<Activity> | ((activity: Partial<Activity>, description?: string) => void), description?: string, timeout?: number): TestFlow;
    /**
     * Send something to the bot
     * @param userSays text or activity simulating user input
     */
    send(userSays: string | Partial<Activity>): TestFlow;
    /**
     * Throws if the bot's response doesn't match the expected text/activity
     * @param expected expected text or activity from the bot, or callback to inspect object
     * @param description description of test case
     * @param timeout (default 3000ms) time to wait for response from bot
     */
    assertReply(expected: string | Partial<Activity> | TestActivityInspector, description?: string, timeout?: number): TestFlow;
    /**
     * throws if the bot's response is not one of the candidate strings
     * @param candidates candidate responses
     * @param description description of test case
     * @param timeout (default 3000ms) time to wait for response from bot
     */
    assertReplyOneOf(candidates: string[], description?: string, timeout?: number): TestFlow;
    /**
     * Insert delay before continuing
     * @param ms ms to wait
     */
    delay(ms: number): TestFlow;
    then(onFulfilled?: () => void): TestFlow;
    catch(onRejected?: (reason: any) => void): TestFlow;
}
