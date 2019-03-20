/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogCommand, Dialog, DialogConfiguration } from 'botbuilder-dialogs';
import { PlanningContext, PlanStepState, PlanChangeType } from '../planningContext';

export interface DoStepsBeforeTagsConfiguration extends DialogConfiguration {
    tags?: string[];
    steps?: Dialog[];
}

export class DoStepsBeforeTags extends DialogCommand {
    public tags: string[];

    public steps: Dialog[];

    /**
     * 
     * @param tags 
     * @param steps 
     */
    constructor();
    constructor(tags: string|string[], steps: Dialog[]);
    constructor(tags?: string|string[], steps?: Dialog[]) {
        super();
        this.tags = typeof tags == 'string' ? [tags] : tags || [];
        this.steps = steps || [];
    }

    public configure(config: DoStepsBeforeTagsConfiguration): this {
        return super.configure(config);
    }

    public getDependencies(): Dialog[] {
        return this.steps;
    }

    protected onComputeID(): string {
        const stepList = this.getDependencies().map((step) => step.id).join(',');
        return `doBeforeTags[${this.hashedLabel(stepList)}]`;
    }

    protected async onRunCommand(planning: PlanningContext, options?: object): Promise<DialogTurnResult> {
        // Ensure planning context
        if (!(planning instanceof PlanningContext)) { throw new Error(`DoStepsBeforeTags: should only be used within a planning or sequence dialog.`) }

        // Create change list
        const steps = this.steps.map((step) => {
            return {
                dialogStack: [],
                dialogId: step.id,
                options: options
            } as PlanStepState
        });

        // Queue up steps to run later in the the plan
        await planning.queueChanges({ changeType: PlanChangeType.doStepsBeforeTags, tags: this.tags, steps: steps });
        return await planning.endDialog();
    }
}