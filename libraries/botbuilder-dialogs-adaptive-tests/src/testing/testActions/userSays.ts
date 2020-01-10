/**
 * @module botbuilder-dialogs-adaptive-tests
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext } from 'botbuilder-core';
import { Configurable } from 'botbuilder-dialogs';
import { TestAction } from '../testAction';
import { AdaptiveTestAdapter } from '../adaptiveTestAdapter';

export interface UserSaysConfiguration {
    text?: string;
    user?: string;
}

export class UserSays extends Configurable implements TestAction {

    public static readonly declarativeType: string = 'Microsoft.Test.UserSays';

    /**
     * The text to send to the bot.
     */
    public text: string;

    /**
     * If user is set then the channalAccount.id and channelAccount.name will be from user.
     */
    public user: string;

    public configure(config: UserSaysConfiguration): this {
        return super.configure(config);
    }

    public async execute(testAdapter: AdaptiveTestAdapter, callback: (context: TurnContext) => Promise<any>): Promise<any> {
        if (!this.text) {
            throw new Error('You must define the text property');
        }

        const activity = testAdapter.makeActivity(this.text);
        if (this.user) {
            activity.from = Object.assign({}, activity.from);
            activity.from.id = this.user;
            activity.from.name = this.user;
        }

        await testAdapter.processActivity(activity, callback);
    }
}