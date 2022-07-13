/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TurnContext, TestAdapter } from 'botbuilder-core';
import { Inspector, TestAction } from '../testAction';

export interface UserDelayConfiguration {
    timespan?: number;
}

/**
 * Script action to delay test script for specified timespan.
 */
export class UserDelay extends TestAction implements UserDelayConfiguration {
    static $kind = 'Microsoft.Test.UserDelay';

    /**
     * The timespan in milliseconds to delay.
     */
    timespan: number;

    /**
     * Execute the test.
     *
     * @param _testAdapter Adapter to execute against.
     * @param _callback Logic for the bot to use.
     * @param _inspector Inspector for dialog context.
     * @returns A Promise that represents the work queued to execute.
     */
    async execute(
        _testAdapter: TestAdapter,
        _callback: (context: TurnContext) => Promise<any>,
        _inspector?: Inspector
    ): Promise<void> {
        await Promise.resolve((resolve) => setTimeout(resolve, this.timespan));
    }
}
