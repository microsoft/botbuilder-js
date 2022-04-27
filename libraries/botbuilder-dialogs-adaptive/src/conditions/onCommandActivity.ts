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
 * Actions triggered when a Command activity is received.
 */
export class OnCommandActivity extends OnActivity {
    static $kind = 'Microsoft.OnCommandActivity';

    /**
     * Intiializes a new instance of the [OnCommandActivity](xref:botbuilder-dialogs-adaptive.OnCommandActivity) class.
     *
     * @param actions Optional, list of actions.
     * @param condition Optional, condition which needs to be met for the actions to be executed.
     */
    constructor(actions?: Dialog[], condition?: string) {
        super(ActivityTypes.Command, actions, condition);
    }
}
