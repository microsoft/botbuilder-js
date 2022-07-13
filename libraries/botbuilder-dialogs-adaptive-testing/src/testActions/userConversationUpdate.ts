/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TurnContext, ActivityTypes, ChannelAccount, RoleTypes, TestAdapter } from 'botbuilder-core';
import { Inspector, TestAction } from '../testAction';

export interface UserConversationUpdateConfiguration {
    membersAdded?: string[];
    membersRemoved?: string[];
}

/**
 * Action to script sending a conversationUpdate activity to the bot.
 */
export class UserConversationUpdate extends TestAction implements UserConversationUpdateConfiguration {
    static $kind = 'Microsoft.Test.UserConversationUpdate';

    /**
     * The members added names.
     */
    membersAdded: string[];

    /**
     * The members removed names.
     */
    membersRemoved: string[];

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
        const activity = testAdapter.makeActivity();
        activity.type = ActivityTypes.ConversationUpdate;

        if (this.membersAdded) {
            activity.membersAdded = this.membersAdded.map((member) => {
                return {
                    id: member,
                    name: member,
                    role: RoleTypes.User,
                } as ChannelAccount;
            });
        }

        if (this.membersRemoved) {
            activity.membersRemoved = this.membersRemoved.map((member) => {
                return {
                    id: member,
                    name: member,
                    role: RoleTypes.User,
                } as ChannelAccount;
            });
        }

        await testAdapter.processActivity(activity, callback);
    }
}
