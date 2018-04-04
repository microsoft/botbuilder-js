"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const botbuilder_core_1 = require("botbuilder-core");
const assert = require("assert");
/**
 * :package: **botbuilder-core-extensions**
 *
 * Test adapter used for unit tests.
 */
class TestAdapter extends botbuilder_core_1.BotAdapter {
    /**
     * Creates a new instance of the test adapter.
     * @param botLogic The bots logic that's under test.
     * @param template (Optional) activity containing default values to assign to all test messages received.
     */
    constructor(botLogic, template) {
        super();
        this.botLogic = botLogic;
        this.nextId = 0;
        /** INTERNAL: used to drive the promise chain forward when running tests. */
        this.activityBuffer = [];
        this.updatedActivities = [];
        this.deletedActivities = [];
        this.template = Object.assign({
            channelId: 'test',
            serviceUrl: 'https://test.com',
            from: { id: 'user', name: 'User1' },
            recipient: { id: 'bot', name: 'Bot' },
            conversation: { id: 'Convo1' }
        }, template);
    }
    sendActivities(context, activities) {
        const responses = activities.map((activity) => {
            this.activityBuffer.push(activity);
            return { id: (this.nextId++).toString() };
        });
        return Promise.resolve(responses);
    }
    updateActivity(context, activity) {
        this.updatedActivities.push(activity);
        return Promise.resolve();
    }
    deleteActivity(context, reference) {
        this.deletedActivities.push(reference);
        return Promise.resolve();
    }
    continueConversation(reference, logic) {
        return Promise.reject(new Error(`not implemented`));
    }
    /**
     * Processes and activity received from the user.
     * @param activity Text or activity from user.
     */
    receiveActivity(activity) {
        // Initialize request
        const request = Object.assign({}, this.template, typeof activity === 'string' ? { type: botbuilder_core_1.ActivityTypes.Message, text: activity } : activity);
        if (!request.type) {
            request.type = botbuilder_core_1.ActivityTypes.Message;
        }
        if (!request.id) {
            request.id = (this.nextId++).toString();
        }
        // Create context object and run middleware
        const context = new botbuilder_core_1.TurnContext(this, request);
        return this.runMiddleware(context, this.botLogic);
    }
    /**
     * Send something to the bot
     * @param userSays text or activity simulating user input
     */
    send(userSays) {
        return new TestFlow(this.receiveActivity(userSays), this);
    }
    /**
     * Send something to the bot and expect the bot to reply
     * @param userSays text or activity simulating user input
     * @param expected expected text or activity from the bot
     * @param description description of test case
     * @param timeout (default 3000ms) time to wait for response from bot
     */
    test(userSays, expected, description, timeout) {
        return this.send(userSays)
            .assertReply(expected, description);
    }
}
exports.TestAdapter = TestAdapter;
/**
 * :package: **botbuilder-core-extensions**
 *
 *  INTERNAL support class for `TestAdapter`.
 */
class TestFlow {
    constructor(previous, adapter) {
        this.previous = previous;
        this.adapter = adapter;
    }
    /**
     * Send something to the bot and expect the bot to reply
     * @param userSays text or activity simulating user input
     * @param expected expected text or activity from the bot
     * @param description description of test case
     * @param timeout (default 3000ms) time to wait for response from bot
     */
    test(userSays, expected, description, timeout) {
        return this.send(userSays)
            .assertReply(expected, description || `test("${userSays}", "${expected}")`, timeout);
    }
    /**
     * Send something to the bot
     * @param userSays text or activity simulating user input
     */
    send(userSays) {
        return new TestFlow(this.previous.then(() => this.adapter.receiveActivity(userSays)), this.adapter);
    }
    /**
     * Throws if the bot's response doesn't match the expected text/activity
     * @param expected expected text or activity from the bot, or callback to inspect object
     * @param description description of test case
     * @param timeout (default 3000ms) time to wait for response from bot
     */
    assertReply(expected, description, timeout) {
        function defaultInspector(reply, description) {
            if (typeof expected === 'object') {
                validateActivity(reply, expected);
            }
            else {
                assert.equal(reply.type, botbuilder_core_1.ActivityTypes.Message, description + ` type === '${reply.type}'. `);
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
     * throws if the bot's response is not one of the candidate strings
     * @param candidates candidate responses
     * @param description description of test case
     * @param timeout (default 3000ms) time to wait for response from bot
     */
    assertReplyOneOf(candidates, description, timeout) {
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
    delay(ms) {
        return new TestFlow(this.previous.then(() => {
            return new Promise((resolve, reject) => { setTimeout(() => resolve(), ms); });
        }), this.adapter);
    }
    then(onFulfilled) {
        return new TestFlow(this.previous.then(onFulfilled), this.adapter);
    }
    catch(onRejected) {
        return new TestFlow(this.previous.catch(onRejected), this.adapter);
    }
}
exports.TestFlow = TestFlow;
function validateActivity(activity, expected) {
    for (const prop in expected) {
        assert.equal(activity[prop], expected[prop]);
    }
}
//# sourceMappingURL=testAdapter.js.map