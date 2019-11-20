/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, Dialog, DialogConfiguration } from 'botbuilder-dialogs';
import { ActionChangeType, SequenceContext, ActionChangeList, ActionState } from '../sequenceContext';

export interface EditActionsConfiguration extends DialogConfiguration {
    /**
     * The type of change to make to the dialogs list of actions.
     */
    changeType?: ActionChangeType;

    /**
     * The actions to update the dialog with.
     */
    actions?: Dialog[];
}

export class EditActions<O extends object = {}> extends Dialog<O> {
    /**
     * The type of change to make to the dialogs list of actions.
     */
    public changeType: ActionChangeType;

    /**
     * The actions to update the dialog with.
     */
    public actions: Dialog[];

    /**
     * Creates a new `EditActions` instance.
     * @param changeType The type of change to make to the dialogs list of actions.
     * @param actions The actions to update the dialog with.
     */
    constructor();
    constructor(changeType: ActionChangeType, actions: Dialog[]);
    constructor(changeType?: ActionChangeType, actions?: Dialog[]) {
        super();
        if (changeType !== undefined) { this.changeType = changeType }
        if (Array.isArray(actions)) { this.actions = actions }
    }

    protected onComputeId(): string {
        const idList = this.actions.map(action => action.id);
        return `EditActions[${this.changeType}|${idList.join(',')}]`;
    }

    public configure(config: EditActionsConfiguration): this {
        return super.configure(config);
    }

    public getDependencies(): Dialog[] {
        return this.actions;
    }

    public async beginDialog(sequence: SequenceContext, options: O): Promise<DialogTurnResult> {
        // Ensure planning context and condition
        if (!(sequence instanceof SequenceContext)) { throw new Error(`EditAction should only be used in the context of an adaptive dialog.`) }
        if (this.changeType == undefined) { throw new Error(`No 'changeType' specified.`) }

        // Queue changes
        const changes: ActionChangeList = {
            changeType: this.changeType,
            actions: this.actions.map((action) => {
                return { dialogId: action.id, dialogStack: [] } as ActionState
            })
        };
        sequence.queueChanges(changes);

        return await sequence.endDialog();
    }
}
