/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog } from 'botbuilder-dialogs';
import { AdaptiveEvents, SequenceContext, ActionChangeList, ActionChangeType } from '../sequenceContext';
import { OnDialogEvent } from './onDialogEvent';

/**
 * Actions triggered when an error event has been emitted.
 */
export class OnError extends OnDialogEvent {

    public constructor(actions: Dialog[] = [], condition?: string) {
        super(AdaptiveEvents.error, actions, condition);
    }

    public onCreateChangeList(planningContext: SequenceContext, dialogOptions?: any): ActionChangeList {
        const changeList = super.onCreateChangeList(planningContext, dialogOptions);

        // For OnError handling we want to replace the old plan with whatever the error plan is, 
        // since the old plan blew up.
        changeList.changeType = ActionChangeType.replaceSequence;
        return changeList;
    }
}