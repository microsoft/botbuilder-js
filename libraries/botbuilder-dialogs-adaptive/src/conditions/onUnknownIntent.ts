/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { OnDialogEvent } from './onDialogEvent';
import { AdaptiveEventNames } from '../sequenceContext';
import { Dialog } from 'botbuilder-dialogs';

/**
 * This rule is triggered when a message is received and is not handled by an OnIntent.
 *
 * @remarks
 * A message is considered unhandled if there were no other conditions triggered by the message and 
 * there is no active plan being executed.
 */
export class OnUnknownIntent extends OnDialogEvent {

    /**
     * Creates a new `OnUnknownIntent` instance.
     * @param actions (Optional) list of actions to update the plan with when triggered.
     */
    constructor(actions?: Dialog[]) {
        super(AdaptiveEventNames.unknownIntent, actions, false);
    }
}
