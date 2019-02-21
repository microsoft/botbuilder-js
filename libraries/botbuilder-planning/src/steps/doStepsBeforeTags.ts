/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogCommand, DialogContext, DialogContextState, Dialog } from 'botbuilder-dialogs';
import { PlanningContext, PlanStepState, PlanChangeType } from '../planningContext';

export class DoStepsBeforeTags extends DialogCommand {
    private readonly _steps: Dialog[];
    
    public tags: string[];

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
        this._steps = steps || [];
    }

    public get steps(): Dialog[] {
        return this._steps;
    }

    protected onComputeID(): string {
        const stepList = this.steps.map((step) => step.id);
        return `doStepsBeforeTagsLater(${this.tags.join(',')},${stepList.join(',')})`;
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