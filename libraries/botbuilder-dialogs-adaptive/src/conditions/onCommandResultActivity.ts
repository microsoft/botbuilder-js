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
 * Actions triggered when a CommandResult activity is received.
 */
export class OnCommandResultActivity extends OnActivity {
    static $kind = 'Microsoft.OnCommandResultActivity';

    /**
     * Intiializes a new instance of the [OnCommandResultActivity](xref:botbuilder-dialogs-adaptive.OnCommandResultActivity) class.
     *
     * @param actions Optional, list of actions.
     * @param condition Optional, condition which needs to be met for the actions to be executed.
     */
    constructor(actions?: Dialog[], condition?: string) {
        super(ActivityTypes.CommandResult, actions, condition);
    }
}
