/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ActivityTypes } from 'botbuilder';
import { Dialog } from 'botbuilder-dialogs';
import { OnActivity } from './onActivity';

/**
 * Actions triggered when a MessageUpdateActivity is received.
 */
export class OnMessageUpdateActivity extends OnActivity {
    static $kind = 'Microsoft.OnMessageUpdateActivity';

    /**
     * Initializes a new instance of the [OnMessageUpdateActivity](xref:botbuilder-dialogs-adaptive.OnMessageUpdateActivity) class.
     *
     * @param actions Optional. A [Dialog](xref:botbuilder-dialogs.Dialog) list containing the actions to add to the plan when the rule constraints are met.
     * @param condition Optional. Condition which needs to be met for the actions to be executed.
     */
    constructor(actions: Dialog[] = [], condition?: string) {
        super(ActivityTypes.MessageUpdate, actions, condition);
    }
}
