/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog, TurnPath } from 'botbuilder-dialogs';
import { OnDialogEvent } from './onDialogEvent';
import { ActionContext } from '../actionContext';
import { AdaptiveEvents } from '../adaptiveEvents';
import { ActionChangeList } from '../actionChangeList';
import { ActionChangeType } from '../actionChangeType';
import { NumberExpression } from 'adaptive-expressions';

/**
 * Actions triggered when an error event has been emitted.
 */
export class OnError extends OnDialogEvent {
    static $kind = 'Microsoft.OnError';

    /**
     * Gets or sets the number of executions allowed. Used to avoid infinite loops in case of error (OPTIONAL).
     */
    executionLimit: NumberExpression = new NumberExpression(0);

    /**
     * Initializes a new instance of the [OnError](xref:botbuilder-dialogs-adaptive.OnError) class.
     *
     * @param actions Optional. A [Dialog](xref:botbuilder-dialogs.Dialog) list containing the actions to add to the plan when the rule constraints are met.
     * @param condition Optional. Condition which needs to be met for the actions to be executed.
     */
    constructor(actions: Dialog[] = [], condition?: string) {
        super(AdaptiveEvents.error, actions, condition);
    }

    /**
     * Method called to execute the condition's actions.
     *
     * @param actionContext Context.
     * @returns A promise with plan change list.
     */
    async execute(actionContext: ActionContext): Promise<ActionChangeList[]> {
        const limit = this.currentExecutionLimit();

        actionContext.state.setValue(TurnPath.executionLimit, limit);

        return await super.execute(actionContext);
    }

    /**
     * Called when a change list is created.
     *
     * @param actionContext [ActionContext](xref:botbuilder-dialogs-adaptive.ActionContext) to use for evaluation.
     * @param dialogOptions Optional. Object with dialog options.
     * @returns An [ActionChangeList](xref:botbuilder-dialogs-adaptive.ActionChangeList) with the list of actions.
     */
    onCreateChangeList(actionContext: ActionContext, dialogOptions?: any): ActionChangeList {
        const changeList = super.onCreateChangeList(actionContext, dialogOptions);

        // For OnError handling we want to replace the old plan with whatever the error plan is,
        // since the old plan blew up.
        changeList.changeType = ActionChangeType.replaceSequence;
        return changeList;
    }

    currentExecutionLimit = function (): number {
        if (this.executionLimit > 0) {
            return this.executionLimit;
        }
        //10 is the default number of executions we'll allow before breaking the loop.
        return 10;
    };
}
