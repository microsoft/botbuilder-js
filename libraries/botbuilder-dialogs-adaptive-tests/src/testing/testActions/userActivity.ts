/**
 * @module botbuilder-dialogs-adaptive-tests
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, TurnContext } from 'botbuilder-core';
import { Configurable } from 'botbuilder-dialogs';
import { TestAction } from '../testAction';
import { AdaptiveTestAdapter } from '../adaptiveTestAdapter';

export interface UserActivityConfiguration {
    activity?: Activity;
    user?: string;
}

export class UserActivity extends Configurable implements TestAction {

    public static readonly declarativeType: string = 'Microsoft.Test.UserActivity';

    /**
     * The activity to compare.
     */
    public activity: Activity;

    /**
     * If user is set then the channalAccount.id and channelAccount.name will be from user.
     */
    public user: string;

    public configure(config: UserActivityConfiguration): this {
        return super.configure(config);
    }

    public async execute(testAdapter: AdaptiveTestAdapter, callback: (context: TurnContext) => Promise<any>): Promise<any> {
        if (!this.activity) {
            throw new Error('You must define one of Text of Activity properties');
        }

        const activity = Object.assign({}, this.activity);
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
            activity.from = Object.assign({}, activity.from);
            activity.from.id = this.user;
            activity.from.name = this.user;
        }
        activity.locale = testAdapter.locale;

        await testAdapter.processActivity(activity, callback);
    }
}