/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, Dialog, DialogDependencies, DialogContext } from 'botbuilder-dialogs';
import { ActionChangeType, SequenceContext, ActionChangeList, ActionState } from '../sequenceContext';
import { BoolExpression, EnumExpression } from '../expressions';

export class EditActions<O extends object = {}> extends Dialog<O> implements DialogDependencies {
    public constructor();
    public constructor(changeType: ActionChangeType, actions?: Dialog[]);
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

    public getDependencies(): Dialog[] {
        return this.actions;
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        if (dc instanceof SequenceContext) {
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

            dc.queueChanges(changes);
            return await dc.endDialog();
        } else {
            throw new Error(`EditActions should only be used in the context of an adaptive dialog.`);
        }
    }

    protected onComputeId(): string {
        const idList = this.actions.map((action: Dialog): string => action.id);
        return `EditActions[${ this.changeType.toString() }|${ idList.join(',') }]`;
    }

}
