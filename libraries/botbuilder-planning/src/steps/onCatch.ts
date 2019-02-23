/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogCommand, DialogTurnResult, Dialog, DialogContext, DialogEvent, DialogConfiguration } from 'botbuilder-dialogs';
import { PlanningContext, PlanStepState, PlanChangeType } from '../planningContext';

export interface OnCatchConfiguration extends DialogConfiguration {
    doStep?: Dialog;
    conditionals?: OnCatchConditional[];
}

export interface OnCatchConditional {
    eventName: string;
    steps: Dialog[];
}

export class OnCatch extends DialogCommand {
    /**
     * Step to run.
     */
    public doStep: Dialog;

    /**
     * Event catches.
     */
    public conditionals: OnCatchConditional[] = [];

    /**
     * Creates a new `OnCatch` instance.
     * @param doStep The primary step to execute.
     */
    constructor();
    constructor(doStep?: Dialog);
    constructor(doStep?: Dialog) {
        super();
        this.doStep = doStep;
    }

    protected onComputeID(): string {
        return `onCatch[${this.hashedLabel(this.doStep.id)}]`;
    }

    public configure(config: OnCatchConfiguration): this {
        return super.configure(config);
    }

    public getDependencies(): Dialog[] {
        const steps: Dialog[] = [this.doStep];
        this.conditionals.forEach((c) => c.steps.forEach((s) => steps.push(s)));
        return steps;
    }

    public case(eventName: string, steps: Dialog[]): this {
        this.conditionals.push({ eventName: eventName, steps: steps });
        return this;
    }

    protected async onRunCommand(dc: DialogContext, options: object): Promise<DialogTurnResult> {
        // Save our initial options and start the doStep
        dc.activeDialog.state['options'] = options;
        return await dc.beginDialog(this.doStep.id, options);
    }

    public async onDialogEvent(dc: DialogContext, event: DialogEvent): Promise<boolean> {
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
            // Find conditional matching event
            for (let i = 0; i < this.conditionals.length; i++) {
                const c = this.conditionals[i];
                if (c.eventName === event.name) {
                    // Create list of steps to run
                    const options = dc.activeDialog.state['options'];
                    const steps = c.steps.map((step) => {
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
        }

        return false;
    }
}
