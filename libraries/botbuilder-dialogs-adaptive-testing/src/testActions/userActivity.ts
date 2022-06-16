/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as z from 'zod';
import { Activity, TurnContext, TestAdapter } from 'botbuilder-core';
import { Inspector, TestAction } from '../testAction';

export interface UserActivityConfiguration {
    activity?: Activity;
    user?: string;
}

/**
 * Send an activity to the bot.
 */
export class UserActivity extends TestAction implements UserActivityConfiguration {
    static $kind = 'Microsoft.Test.UserActivity';

    /**
     * The activity to compare.
     */
    activity: Activity;

    /**
     * If user is set then the channalAccount.id and channelAccount.name will be from user.
     */
    user: string;

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
        if (!this.activity) {
            throw new Error('You must define one of Text of Activity properties');
        }

        const activity = { ...this.activity };
        const reference = testAdapter.conversation;
        activity.channelId = reference.channelId;
        activity.serviceUrl = reference.serviceUrl;
        activity.conversation = reference.conversation;
        activity.from = reference.user;
        activity.recipient = reference.bot;
        if (reference.activityId) {
            activity.id = reference.activityId;
        }

        if (this.user) {
            activity.from = { ...activity.from };
            activity.from.id = this.user;
            activity.from.name = this.user;
        } else if (z.record(z.unknown()).check(this.activity?.from)) {
            activity.from = { ...this.activity.from };
        }

        activity.locale = testAdapter.locale;

        await testAdapter.processActivity(activity, callback);
    }
}
