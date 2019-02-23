/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogCommand, Dialog, DialogConfiguration } from 'botbuilder-dialogs';
import { PlanningContext, PlanStepState, PlanChangeType } from '../planningContext';

export interface DoStepsLaterConfiguration extends DialogConfiguration {
    steps?: Dialog[];
}

export class DoStepsLater extends DialogCommand {
    public steps: Dialog[];
    
    /**
     * 
     * @param steps
     */
    constructor();
    constructor(steps: Dialog[]);
    constructor(steps?: Dialog[]) {
        super();
        this.steps = steps || [];
    }

    public configure(config: DoStepsLaterConfiguration): this {
        return super.configure(config);
    }

    public getDependencies(): Dialog[] {
        return this.steps;
    }

    protected onComputeID(): string {
        const stepList = this.getDependencies().map((step) => step.id).join(',');
        return `doStepsLater[${this.hashedLabel(stepList)}]`;
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