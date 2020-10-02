/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TurnContext, TestAdapter } from 'botbuilder-core';
import { TestAction } from '../testAction';

export interface UserDelayConfiguration {
    timespan?: number;
}

/**
 * Script action to delay test script for specified timespan.
 */
export class UserDelay implements TestAction {
    /**
     * The timespan in milliseconds to delay.
     */
    public timespan: number;

    /**
     * Execute the test.
     * @param _testAdapter Adapter to execute against.
     * @param _callback Logic for the bot to use.
     * @returns A Promise that represents the work queued to execute.
     */
    public async execute(_testAdapter: TestAdapter, _callback: (context: TurnContext) => Promise<any>): Promise<any> {
        await Promise.resolve(resolve => setTimeout(resolve, this.timespan));
    }
}
