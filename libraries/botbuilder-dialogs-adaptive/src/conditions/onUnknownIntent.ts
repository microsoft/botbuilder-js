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
 * Actions triggered when a UnknownIntent event has been emitted by the recognizer.
 * @remarks
 * A message is considered unhandled if there were no other conditions triggered by the message and 
 * there is no active plan being executed.
 * This trigger is run when the utterance is not recognized and the fallback consultation is happening 
 * It will only trigger if and when 
 *  * it is the leaf dialog AND 
 *  * none of the parent dialogs handle the event 
 * This provides the parent dialogs the opportunity to handle global commands as fallback interruption.
 */
export class OnUnknownIntent extends OnDialogEvent {

    /**
     * Creates a new `OnUnknownIntent` instance.
     * @param actions (Optional) The actions to add to the plan when the rule constraints are met.
     * @param condition (Optional) The condition which needs to be met for the actions to be executed.
     */
    constructor(actions: Dialog[] = null, condition: string = null) {
        super(AdaptiveEventNames.unknownIntent, actions, condition);
    }
}
