/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { StringUtils } from 'botbuilder-core';
import { DialogTurnResult, Dialog, DialogDependencies, DialogContext } from 'botbuilder-dialogs';
import { BoolExpression, EnumExpression } from 'adaptive-expressions';
import { ActionContext } from '../actionContext';
import { ActionChangeType } from '../actionChangeType';
import { ActionState } from '../actionState';
import { ActionChangeList } from '../actionChangeList';

/**
 * Class which allows you to edit the current actions. 
 */
export class EditActions<O extends object = {}> extends Dialog<O> implements DialogDependencies {
    public constructor();

    /**
     * Initializes a new instance of the `EditActions` class.
     * @param changeType Type of change to appy to the active actions
     * @param actions Optional, child dialog dependencies so they can be added to the containers dialogset
     */

    public constructor(changeType: ActionChangeType, actions?: Dialog[]);

    /**
     * Initializes a new instance of the `EditActions` class.
     * @param changeType Optional, type of change to appy to the active actions
     * @param actions Optional, child dialog dependencies so they can be added to the containers dialogset
     */
    public constructor(changeType?: ActionChangeType, actions?: Dialog[]) {
        super();
        if (changeType) { this.changeType = new EnumExpression<ActionChangeType>(changeType); }
        if (actions) { this.actions = actions; }
    }

    /**
     * The actions to update the dialog with.
     */
    public actions: Dialog[];

    /**
     * The type of change to make to the dialogs list of actions.
     */
    public changeType: EnumExpression<ActionChangeType>;

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    /**
     * Gets the child dialog dependencies so they can be added to the containers dialog set.
     * @returns The child dialog dependencies.
     */
    public getDependencies(): Dialog[] {
        return this.actions;
    }

    /**
     * Starts a new dialog and pushes it onto the dialog stack.
     * @param dc The `DialogContext` for the current turn of conversation.
     * @param result Optional, value returned from the dialog that was called. The type 
     * of the value returned is dependent on the child dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        if (dc.parent instanceof ActionContext) {
            const planActions = this.actions.map((action: Dialog): ActionState => {
                return {
                    dialogStack: [],
                    dialogId: action.id,
                    options: options
                };
            });

            const changes: ActionChangeList = {
                changeType: this.changeType.getValue(dc.state),
                actions: planActions
            };

            dc.parent.queueChanges(changes);
            return await dc.endDialog();
        } else {
            throw new Error(`EditActions should only be used in the context of an adaptive dialog.`);
        }
    }

    /**
     * @protected
     * Builds the compute Id for the dialog.
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        const idList = this.actions.map((action: Dialog): string => action.id);
        return `EditActions[${ this.changeType.toString() }|${ StringUtils.ellipsis(idList.join(','), 50) }]`;
    }

}
