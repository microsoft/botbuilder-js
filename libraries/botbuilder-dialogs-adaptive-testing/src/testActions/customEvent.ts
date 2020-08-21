/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TurnContext, ActivityTypes } from 'botbuilder-core';
import { TestAction } from '../testAction';
import { AdaptiveTestAdapter } from '../adaptiveTestAdapter';

export class CustomEvent implements TestAction {
    /**
     * The event name.
     */
    public name: string;

    /**
     * Event value.
     */
    public value: any;

    public async execute(testAdapter: AdaptiveTestAdapter, callback: (context: TurnContext) => Promise<any>): Promise<any> {
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