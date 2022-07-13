/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TurnContext, ActivityTypes, TestAdapter } from 'botbuilder-core';
import { Configurable } from 'botbuilder-dialogs';
import { Inspector, TestAction } from '../testAction';

export interface UserTypingConfiguration {
    user?: string;
}

/**
 * Action to script sending typing activity to the bot.
 */
export class UserTyping extends Configurable implements TestAction, UserTypingConfiguration {
    static $kind = 'Microsoft.Test.UserTyping';

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
        callback: (context: TurnContext) => Promise<any>,
        _inspector?: Inspector
    ): Promise<any> {
        const typing = testAdapter.makeActivity();
        typing.type = ActivityTypes.Typing;

        if (this.user) {
            typing.from = Object.assign({}, typing.from);
            typing.from.id = this.user;
            typing.from.name = this.user;
        }

        await testAdapter.processActivity(typing, callback);
    }
}
