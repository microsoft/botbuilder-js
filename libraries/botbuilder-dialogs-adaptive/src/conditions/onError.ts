/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog } from 'botbuilder-dialogs';
import { OnDialogEvent } from './onDialogEvent';
import { ActionContext } from '../actionContext';
import { AdaptiveEvents } from '../adaptiveEvents';
import { ActionChangeList } from '../actionChangeList';
import { ActionChangeType } from '../actionChangeType';

/**
 * Actions triggered when an error event has been emitted.
 */
export class OnError extends OnDialogEvent {

    public constructor(actions: Dialog[] = [], condition?: string) {
        super(AdaptiveEvents.error, actions, condition);
    }

    public onCreateChangeList(actionContext: ActionContext, dialogOptions?: any): ActionChangeList {
        const changeList = super.onCreateChangeList(actionContext, dialogOptions);

        // For OnError handling we want to replace the old plan with whatever the error plan is, 
        // since the old plan blew up.
        changeList.changeType = ActionChangeType.replaceSequence;
        return changeList;
    }
}