/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TurnContext, ActivityTypes, ChannelAccount, RoleTypes, TestAdapter } from 'botbuilder-core';
import { TestAction } from '../testAction';

/**
 * Action to script sending a conversationUpdate activity to the bot.
 */
export class UserConversationUpdate implements TestAction {
    /**
     * The members added names.
     */
    public membersAdded: string[];

    /**
     * The members removed names.
     */
    public membersRemoved: string[];

    /**
     * Execute the test.
     * @param testAdapter Adapter to execute against.
     * @param callback Logic for the bot to use.
     * @returns A Promise that represents the work queued to execute.
     */
    public async execute(testAdapter: TestAdapter, callback: (context: TurnContext) => Promise<any>): Promise<any> {
        const activity = testAdapter.makeActivity();
        activity.type = ActivityTypes.ConversationUpdate;

        if (this.membersAdded) {
            activity.membersAdded = this.membersAdded.map(member => {
                return {
                    id: member,
                    name: member,
                    role: RoleTypes.User
                } as ChannelAccount;
            });
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
