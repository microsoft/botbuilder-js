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
 * Actions triggered when a InstallationUpdateActivity is received.
 */
export class OnInstallationUpdateActivity extends OnActivity {
    static $kind = 'Microsoft.OnInstallationUpdateActivity';

    /**
     * Initializes a new instance of the [OnInstallationUpdateActivity](xref:botbuilder-dialogs-adaptive.OnInstallationUpdateActivity) class.
     *
     * @param actions Optional. A [Dialog](xref:botbuilder-dialogs.Dialog) list containing the actions to add to the plan when the rule constraints are met.
     * @param condition Optional. Condition which needs to be met for the actions to be executed.
     */
    constructor(actions: Dialog[] = [], condition?: string) {
        super(ActivityTypes.InstallationUpdate, actions, condition);
    }
}
