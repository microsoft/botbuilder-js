/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TurnContext, ActivityTypes, ChannelAccount, RoleTypes } from 'botbuilder-core';
import { TestAction } from '../testAction';
import { AdaptiveTestAdapter } from '../adaptiveTestAdapter';

export class UserConversationUpdate implements TestAction {
    /**
     * The members added names.
     */
    public membersAdded: string[];

    /**
     * The members removed names.
     */
    public membersRemoved: string[];

    public async execute(testAdapter: AdaptiveTestAdapter, callback: (context: TurnContext) => Promise<any>): Promise<any> {
        const activity = testAdapter.makeActivity();
        activity.type = ActivityTypes.ConversationUpdate;

        if (this.membersAdded) {
            activity.membersAdded = this.membersAdded.map(member => {
                return {
                    id: member,
                    name: member,
                    role: RoleTypes.User
                } as ChannelAccount;
            })
        }

        if (this.membersRemoved) {
            activity.membersRemoved = this.membersRemoved.map(member => {
                return {
                    id: member,
                    name: member,
                    role: RoleTypes.User
                } as ChannelAccount;
            });
        }

        await testAdapter.processActivity(activity, callback);
    }
}