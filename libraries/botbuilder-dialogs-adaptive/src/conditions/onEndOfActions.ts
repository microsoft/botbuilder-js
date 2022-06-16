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
 * Triggered when all actions and ambiguity events have been processed.
 */
export class OnEndOfActions extends OnDialogEvent {
    static $kind = 'Microsoft.OnEndOfActions';

    /**
     * Creates a new `OnEndOfActions` instance.
     *
     * @param actions (Optional) The actions to add to the plan when the rule constraints are met.
     * @param condition (Optional) The condition which needs to be met for the actions to be executed.
     */
    constructor(actions: Dialog[] = [], condition?: string) {
        super(AdaptiveEvents.endOfActions, actions, condition);
    }
}
