/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog } from 'botbuilder-dialogs';
import { AdaptiveEvents } from '../adaptiveEvents';
import { OnDialogEvent } from './onDialogEvent';

/**
 * Actions triggered when an dialog was canceled.
 */
export class OnCancelDialog extends OnDialogEvent {
    static $kind = 'Microsoft.OnCancelDialog';

    /**
     * Initializes a new instance of the [OnCancelDialog](xref:botbuilder-dialogs-adaptive.OnCancelDialog) class.
     *
     * @param actions Optional. A [Dialog](xref:botbuilder-dialogs.Dialog) list containing the actions to add to the plan when the rule constraints are met.
     * @param condition Optional. Condition which needs to be met for the actions to be executed.
     */
    constructor(actions: Dialog[] = [], condition?: string) {
        super(AdaptiveEvents.cancelDialog, actions, condition);
    }
}
