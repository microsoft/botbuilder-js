/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ActivityAdapter } from './activityAdapter';
import { Activity, ConversationReference } from 'botbuilder-schema';
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
export declare class TestAdapter implements ActivityAdapter {
    private nextId;
    reference: ConversationReference;
    botReplies: Partial<Activity>[];
    /** INTERNAL implementation of `Adapter.onReceive`. */
    onReceive: (activity: Activity) => Promise<void>;
    /**
     * Creates a new instance of the test adapter.
     * @param reference (Optional) conversation reference that lets you customize the address
     * information for messages sent during a test.
     */
    constructor(reference?: ConversationReference);
    /** INTERNAL implementation of `Adapter.post()`. */
    post(activities: Partial<Activity>[]): Promise<undefined>;
    _sendActivityToBot(userSays: string | Partial<Activity>): Promise<void>;
    /**
     * Send something to the bot
     * @param userSays text or activity simulating user input
     */
    send(userSays: string | Partial<Activity>): TestFlow;
    /**
     * wait for time period to pass before continuing
     * @param ms ms to wait for
     */
    delay(ms: number): TestFlow;
    /**
     * Send something to the bot and expect the bot to reply
     * @param userSays text or activity simulating user input
     * @param expected expected text or activity from the bot
     * @param description description of test case
     * @param timeout (default 3000ms) time to wait for response from bot
     */
    test(userSays: string | Partial<Activity>, expected: string | Partial<Activity> | ((activity: Partial<Activity>, description?: string) => void), description?: string, timeout?: number): TestFlow;
    /**
     * Throws if the bot's response doesn't match the expected text/activity
     * @param expected expected text or activity from the bot
     * @param description description of test case
     * @param timeout (default 3000ms) time to wait for response from bot
     */
    assertReply(expected: string | Partial<Activity> | ((activity: Partial<Activity>, description?: string) => void), description?: string, timeout?: number): TestFlow;
    /**
     * throws if the bot's response is not one of the candidate strings
     * @param candidates candidate responses
     * @param description description of test case
     * @param timeout (default 3000ms) time to wait for response from bot
     */
    assertReplyOneOf(candidates: string[], description?: string, timeout?: number): TestFlow;
}
/** INTERNAL support class for `TestAdapter`. */
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
    assertReply(expected: string | Partial<Activity> | ((activity: Partial<Activity>, description?: string) => void), description?: string, timeout?: number): TestFlow;
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
    private validateActivity(activity, expected);
    then(onFulfilled?: () => void): TestFlow;
    catch(onRejected?: (reason: any) => void): TestFlow;
}
