/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, Dialog, DialogConfiguration, DialogDependencies, DialogContext } from 'botbuilder-dialogs';
import { ActionChangeType, SequenceContext, ActionChangeList, ActionState } from '../sequenceContext';

export interface EditActionsConfiguration extends DialogConfiguration {
    changeType?: ActionChangeType;
    actions?: Dialog[];
}

export class EditActions<O extends object = {}> extends Dialog<O> implements DialogDependencies {

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

    public getDependencies(): Dialog[] {
        return this.actions;
    }

    public configure(config: EditActionsConfiguration): this {
        return super.configure(config);
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
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
