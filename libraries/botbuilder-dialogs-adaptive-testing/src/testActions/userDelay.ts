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

export class UserDelay implements TestAction {
    /**
     * The timespan in milliseconds to delay.
     */
    public timespan: number;

    public async execute(_testAdapter: TestAdapter, _callback: (context: TurnContext) => Promise<any>): Promise<any> {
        await Promise.resolve(resolve => setTimeout(resolve, this.timespan));
    }
}