/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ActivityTypes } from 'botbuilder-core';
import { Dialog } from 'botbuilder-dialogs';
import { OnActivity } from './onActivity';

/**
 * Actions triggered when EndOfConversationActivity is received.
 */
export class OnEndOfConversationActivity extends OnActivity {
    /**
     * Initializes a new instance of the `OnEndOfConversationActivity` class.
     * @param actions Optional. Actions to add to the plan when the rule constraints are met.
     * @param condition Optional. Condition which needs to be met for the actions to be executed.
     */
    public constructor(actions: Dialog[] = [], condition?: string) {
        super(ActivityTypes.EndOfConversation, actions, condition);
    }
}
