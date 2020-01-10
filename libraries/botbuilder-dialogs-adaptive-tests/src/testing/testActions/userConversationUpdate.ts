/**
 * @module botbuilder-dialogs-adaptive-tests
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, ActivityTypes, ChannelAccount, RoleTypes } from 'botbuilder-core';
import { Configurable } from 'botbuilder-dialogs';
import { TestAction } from '../testAction';
import { AdaptiveTestAdapter } from '../adaptiveTestAdapter';

export interface UserConversationUpdateConfiguration {
    membersAdded?: string[];
    membersRemoved?: string[];
}

export class UserConversationUpdate extends Configurable implements TestAction {

    public static readonly declarativeType: string = 'Microsoft.Test.UserConversationUpdate';

    /**
     * The members added names.
     */
    public membersAdded: string[];

    /**
     * The members removed names.
     */
    public membersRemoved: string[];

    public configure(config: UserConversationUpdateConfiguration): this {
        return super.configure(config);
    }

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