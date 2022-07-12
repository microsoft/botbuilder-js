/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog } from 'botbuilder-dialogs';
import { OnDialogEvent } from './onDialogEvent';
import { AdaptiveEvents } from '../adaptiveEvents';

/**
 * Actions triggered when an RepromptDialog event is emitted.
 */
export class OnRepromptDialog extends OnDialogEvent {
    static $kind = 'Microsoft.OnRepromptDialog';

    /**
     * Initializes a new instance of the [OnRepromptDialog](xref:botbuilder-dialogs-adaptive.OnRepromptDialog) class.
     *
     * @param actions Optional. A [Dialog](xref:botbuilder-dialogs.Dialog) list containing the actions to add to the plan when the rule constraints are met.
     * @param condition Optional. Condition which needs to be met for the actions to be executed.
     */
    constructor(actions: Dialog[] = [], condition?: string) {
        super(AdaptiveEvents.repromptDialog, actions, condition);
    }
}
