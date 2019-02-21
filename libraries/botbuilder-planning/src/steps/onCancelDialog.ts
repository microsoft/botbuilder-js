/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogCommand, DialogTurnResult, Dialog, DialogContext, DialogContextState, DialogEvent } from 'botbuilder-dialogs';
import { PlanningContext, PlanStepState, PlanChangeType, PlanningEventNames } from '../planningContext';
import { PlanningDialog } from '../planningDialog';

export class OnCancelDialog extends DialogCommand {
    /**
     * Step to run.
     */
    public doStep: Dialog;

    /**
     * Steps that should be run if the [doStep](#dostep) is cancelled.
     */
    public cancellationSteps: Dialog[];

    /**
     * Creates a new `IfCancelled` instance.
     * @param expression The expression to test for the steps "if" clause.
     * @param steps The steps to run if the expression returns true. 
     */
    constructor();
    constructor(doStep?: Dialog, cancellationSteps?: Dialog[]);
    constructor(doStep?: Dialog, cancellationSteps?: Dialog[]) {
        super();
        this.doStep = doStep;
        this.cancellationSteps = cancellationSteps || [];
    }

    protected onComputeID(): string {
        return `onCancelDialog(${this.doStep.id})`;
    }

    public get steps(): Dialog[] {
        return [this.doStep].concat(this.cancellationSteps);
    }

    protected async onRunCommand(dc: DialogContext, options: object): Promise<DialogTurnResult> {
        // Save our initial options and start the doStep
        dc.activeDialog.state['options'] = options;
        return await dc.beginDialog(this.doStep.id, options);
    }

    public async onDialogEvent(dc: DialogContext, event: DialogEvent): Promise<boolean> {
        // Check for cancel event
        if (event.name == PlanningEventNames.cancelDialog) {
            // Find the planning context to use
            // - Theres an issue created by consultation where our current DialogContext might
            //   not have a reference to the actual plan so we need to search for the context to use
            let planning: PlanningContext;
            while (dc) {
                if (dc instanceof PlanningContext && (dc as PlanningContext).plan) {
                    const plan = (dc as PlanningContext).plan;
                    if (plan.steps.length > 0 && plan.steps[0].dialogId == this.id) {
                        planning = dc;
                        break;
                    }
                }
                dc = dc.parent;
            }
            if (planning) {
                // Create list of steps to run
                const options = dc.activeDialog.state['options'];
                const steps = this.cancellationSteps.map((step) => {
                    return {
                        dialogStack: [],
                        dialogId: step.id,
                        options: options
                    } as PlanStepState;
                });

                // Queue up the steps for the current plan
                await planning.queueChanges({ changeType: PlanChangeType.doSteps, steps: steps });

                // Signal that we handled the event
                return true;
            }
        }

        return false;
    }
}
