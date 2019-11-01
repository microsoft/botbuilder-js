/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogCommand, DialogTurnResult, Dialog, DialogConfiguration } from 'botbuilder-dialogs';
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

    /**
     * Tags to insert actions before when [changeType](#changetype) is `ActionChangeType.insertActionsBeforeTags`.
     */
    tags?: string[];
}

export class EditActions extends DialogCommand {
    /**
     * The type of change to make to the dialogs list of actions.
     */
    public changeType: ActionChangeType;

    /**
     * The actions to update the dialog with.
     */
    public actions: Dialog[];

    /**
     * Tags to insert actions before when [changeType](#changetype) is `PlanChangeType.doActionsBeforeTags`.
     */
    public tags: string[];

    /**
     * Creates a new `EditActions` instance.
     * @param changeType The type of change to make to the dialogs list of actions.
     * @param actions The actions to update the dialog with.
     */
    constructor();
    constructor(changeType: ActionChangeType, actions: Dialog[], tags?: string[]);
    constructor(changeType?: ActionChangeType, actions?: Dialog[], tags?: string[]) {
        super();
        if (changeType !== undefined) { this.changeType = changeType }
        if (Array.isArray(actions)) { this.actions = actions }
        if (Array.isArray(tags)) { this.tags = tags }
    }

    protected onComputeID(): string {
        return `editActions[${this.hashedLabel(this.changeType)}]`;
    }

    public configure(config: EditActionsConfiguration): this {
        return super.configure(config);
    }

    public getDependencies(): Dialog[] {
        return this.actions;
    }

    protected async onRunCommand(sequence: SequenceContext, options: object): Promise<DialogTurnResult> {
        // Ensure planning context and condition
        if (!(sequence instanceof SequenceContext)) { throw new Error(`${this.id}: should only be used within a planning or sequence dialog.`) }
        if (this.changeType == undefined) { throw new Error(`${this.id}: no 'changeType' specified.`) }

        // Queue changes
        const changes: ActionChangeList = {
            changeType: this.changeType,
            actions: this.actions.map((action) => {
                return { dialogId: action.id, dialogStack: [] } as ActionState
            })
        };
        if (this.changeType == ActionChangeType.insertActionsBeforeTags) {
            changes.tags = this.tags;
        }
        sequence.queueChanges(changes);

        return await sequence.endDialog();
    }
}
