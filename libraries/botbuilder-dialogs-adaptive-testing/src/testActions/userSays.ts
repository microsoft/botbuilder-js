/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TurnContext, TestAdapter } from 'botbuilder-core';
import { Inspector, TestAction } from '../testAction';

export interface UserSaysConfiguration {
    text?: string;
    user?: string;
}

/**
 * Action to script sending text to the bot.
 */
export class UserSays extends TestAction implements UserSaysConfiguration {
    static $kind = 'Microsoft.Test.UserSays';

    /**
     * The text to send to the bot.
     */
    text: string;

    /**
     * If user is set then the channalAccount.id and channelAccount.name will be from user.
     */
    user: string;

    /**
     * The locale of user.
     */
    locale: string;

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
        if (!this.text) {
            throw new Error('You must define the text property');
        }

        const activity = testAdapter.makeActivity(this.text);
        if (this.user) {
            activity.from = Object.assign({}, activity.from);
            activity.from.id = this.user;
            activity.from.name = this.user;
        }

        if (this.locale) {
            activity.locale = this.locale;
        }

        await testAdapter.processActivity(activity, callback);
    }
}
