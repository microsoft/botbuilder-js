/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, Dialog, DialogConfiguration, DialogDependencies, DialogContext, Configurable } from 'botbuilder-dialogs';
import { Expression, ExpressionEngine } from 'adaptive-expressions';
import { ActionChangeType, SequenceContext, ActionChangeList, ActionState } from '../sequenceContext';

export interface EditActionsConfiguration extends DialogConfiguration {
    changeType?: ActionChangeType;
    actions?: Dialog[];
    disabled?: string;
}

export class EditActions<O extends object = {}> extends Dialog<O> implements DialogDependencies, Configurable {
    public static declarativeType = 'Microsoft.EditActions';

    public constructor();
    public constructor(changeType: ActionChangeType, actions?: Dialog[]);
    public constructor(changeType?: ActionChangeType, actions?: Dialog[]) {
        super();
        if (changeType) { this.changeType = changeType; }
        if (actions) { this.actions = actions; }
    }

    /**
     * The actions to update the dialog with.
     */
    public actions: Dialog[];

    /**
     * The type of change to make to the dialogs list of actions.
     */
    public changeType: ActionChangeType;

    /**
     * Get an optional expression which if is true will disable this action.
     */
    public get disabled(): string {
        return this._disabled ? this._disabled.toString() : undefined;
    }

    /**
     * Set an optional expression which if is true will disable this action.
     */
    public set disabled(value: string) {
        this._disabled = value ? new ExpressionEngine().parse(value) : undefined;
    }

    private _disabled: Expression;

    public getDependencies(): Dialog[] {
        return this.actions;
    }

    public configure(config: EditActionsConfiguration): this {
        return super.configure(config);
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this._disabled) {
            const { value } = this._disabled.tryEvaluate(dc.state);
            if (!!value) {
                return await dc.endDialog();
            }
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
                changeType: this.changeType,
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
        return `EditActions[${ this.changeType }|${ idList.join(',') }]`;
    }

}
