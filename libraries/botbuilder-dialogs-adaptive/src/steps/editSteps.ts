/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogCommand, DialogTurnResult, Dialog, DialogConfiguration } from 'botbuilder-dialogs';
import { StepChangeType, SequenceContext, StepChangeList, StepState } from '../sequenceContext';

export interface EditStepsConfiguration extends DialogConfiguration {
    /**
     * The type of change to make to the dialogs list of steps.
     */
    changeType?: StepChangeType;
    
    /**
     * The steps to update the dialog with.
     */
    steps?: Dialog[];

    /**
     * Tags to insert steps before when [changeType](#changetype) is `StepChangeType.insertStepsBeforeTags`.
     */
    tags?: string[];
}

export class EditSteps extends DialogCommand {
    /**
     * The type of change to make to the dialogs list of steps.
     */
    public changeType: StepChangeType;
    
    /**
     * The steps to update the dialog with.
     */
    public steps: Dialog[];

    /**
     * Tags to insert steps before when [changeType](#changetype) is `PlanChangeType.doStepsBeforeTags`.
     */
    public tags: string[];

    /**
     * Creates a new `EditSteps` instance.
     * @param changeType The type of change to make to the dialogs list of steps.
     * @param steps The steps to update the dialog with.
     */
    constructor();
    constructor(changeType: StepChangeType, steps: Dialog[], tags?: string[]);
    constructor(changeType?: StepChangeType, steps?: Dialog[], tags?: string[]) {
        super();
        if (changeType !== undefined) { this.changeType = changeType }
        if (Array.isArray(steps)) { this.steps = steps }
        if (Array.isArray(tags)) { this.tags = tags }
    }

    protected onComputeID(): string {
        return `editSteps[${this.hashedLabel(this.changeType)}]`;
    }

    public configure(config: EditStepsConfiguration): this {
        return super.configure(config);
    }

    public getDependencies(): Dialog[] {
        return this.steps;
    }

    protected async onRunCommand(sequence: SequenceContext, options: object): Promise<DialogTurnResult> {
        // Ensure planning context and condition
        if (!(sequence instanceof SequenceContext)) { throw new Error(`${this.id}: should only be used within a planning or sequence dialog.`) }
        if (this.changeType == undefined) { throw new Error(`${this.id}: no 'changeType' specified.`) }

        // Queue changes
        const changes: StepChangeList = {
            changeType: this.changeType,
            steps: this.steps.map((step) => {
                return { dialogId: step.id, dialogStack: [] } as StepState
            })
        };
        if (this.changeType == StepChangeType.insertStepsBeforeTags) {
            changes.tags = this.tags;
        }
        sequence.queueChanges(changes);

        return await sequence.endDialog();
    }
}
