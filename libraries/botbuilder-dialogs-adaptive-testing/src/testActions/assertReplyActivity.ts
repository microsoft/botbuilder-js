/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionParser } from 'adaptive-expressions';
import { Activity, TurnContext, TestAdapter } from 'botbuilder-core';
import { Inspector, TestAction } from '../testAction';

export interface AssertReplyActivityConfiguration {
    description?: string;
    timeout?: number;
    assertions?: string[];
}

/**
 * Basic assertion TestAction, which validates assertions against a reply activity.
 */
export class AssertReplyActivity extends TestAction implements AssertReplyActivityConfiguration {
    public static $kind = 'Microsoft.Test.AssertReplyActivity';

    /**
     * Description of what this assertion is.
     */
    public description: string;

    /**
     * The milliseconds to wait for a reply.
     */
    public timeout = 3000;

    /**
     * The expressions for assertions.
     */
    public assertions: string[];

    /**
     * Gets the text to assert for an activity.
     * @returns String.
     */
    public getConditionDescription(): string {
        return this.description || this.assertions.join('\n');
    }

    /**
     * Validates the reply of an activity.
     * @param activity The activity to verify.
     */
    public validateReply(activity: Activity): void {
        if (this.assertions) {
            const engine = new ExpressionParser();
            for (let i = 0; i < this.assertions.length; i++) {
                const assertion = this.assertions[i];
                const { value, error } = engine.parse(assertion).tryEvaluate(activity);
                if (!value || error) {
                    throw new Error(`${this.description} ${assertion} ${JSON.stringify(activity)}`);
                }
            }
        }
    }

    /**
     * Execute the test.
     * @param testAdapter Adapter to execute against.
     * @param callback Logic for the bot to use.
     * @param inspector Inspector for dialog context.
     * @returns A Promise that represents the work queued to execute.
     */
    public async execute(
        testAdapter: TestAdapter,
        callback: (context: TurnContext) => Promise<any>,
        inspector?: Inspector
    ): Promise<any> {
        const start = new Date();
        while (true) {
            const current = new Date();

            if (current.getTime() - start.getTime() > this.timeout) {
                throw new Error(`${this.timeout}ms Timed out waiting for: ${this.getConditionDescription()}`);
            }

            const replyActivity = testAdapter.getNextReply();
            if (replyActivity) {
                this.validateReply(replyActivity as Activity);
                return;
            }

            await Promise.resolve((resolve) => setTimeout(resolve, 100));
        }
    }
}
