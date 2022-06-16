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
 * Triggered to choose which property an entity goes to.
 */
export class OnChooseProperty extends OnDialogEvent {
    static $kind = 'Microsoft.OnChooseProperty';

    /**
     * Initializes a new instance of the [OnChooseProperty](xref:botbuilder-dialogs-adaptive.OnChooseProperty) class.
     *
     * @param {Dialog[]} actions Optional, actions to add to the plan when the rule constraints are met.
     * @param {string} condition Optional, condition which needs to be met for the actions to be executed.
     */
    constructor(actions: Dialog[] = [], condition?: string) {
        super(AdaptiveEvents.chooseProperty, actions, condition);
    }
}
