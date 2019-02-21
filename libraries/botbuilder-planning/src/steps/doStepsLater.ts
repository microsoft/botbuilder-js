/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogCommand, DialogContext, DialogContextState, Dialog } from 'botbuilder-dialogs';
import { PlanningContext, PlanStepState, PlanChangeType } from '../planningContext';

export class DoStepsLater extends DialogCommand {
    private readonly _steps: Dialog[];
    
    /**
     * 
     * @param steps
     */
    constructor();
    constructor(steps: Dialog[]);
    constructor(steps?: Dialog[]) {
        super();
        this._steps = steps || [];
    }

    public get steps(): Dialog[] {
        return this._steps;
    }

    protected onComputeID(): string {
        const stepList = this.steps.map((step) => step.id);
        return `doStepsLater(${stepList.join(',')})`;
    }

    protected async onRunCommand(planning: PlanningContext, options?: object): Promise<DialogTurnResult> {
        // Ensure planning context
        if (!(planning instanceof PlanningContext)) { throw new Error(`DoStepsLater: should only be used within a planning or sequence dialog.`) }

        // Create change list
        const steps = this.steps.map((step) => {
            return {
                dialogStack: [],
                dialogId: step.id,
                options: options
            } as PlanStepState
        });

        // Queue up steps to run at the end of the plan
        await planning.queueChanges({ changeType: PlanChangeType.doStepsLater, steps: steps });
        return await planning.endDialog();
    }
}