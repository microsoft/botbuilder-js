/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TurnContext, TestAdapter, ActivityTypes } from 'botbuilder-core';
import { Inspector, TestAction } from '../testAction';

export interface CustomEventConfiguration {
    name: string;
    value?: unknown;
}

/**
 * Action to script sending custom event to the bot.
 */
export class CustomEvent<T = unknown> extends TestAction implements CustomEventConfiguration {
    static $kind = 'Microsoft.Test.CustomEvent';
    /**
     * The event name.
     */
    name: string;

    /**
     * Event value.
     */
    value?: T;

    /**
     * Execute the test.
     *
     * @param testAdapter Adapter to execute against.
     * @param callback Logic for the bot to use.
     * @param _inspector Inspector for dialog context.
     * @returns A Promise that represents the work queued to execute.
     */
    async execute(
        testAdapter: TestAdapter,
        callback: (context: TurnContext) => Promise<void>,
        _inspector?: Inspector
    ): Promise<void> {
        if (!this.name) {
            throw Error('You must define the event name.');
        }
        const activity = testAdapter.makeActivity();
        activity.type = ActivityTypes.Event;
        activity.name = this.name;
        activity.value = this.value;

        await testAdapter.processActivity(activity, callback);
    }
}
