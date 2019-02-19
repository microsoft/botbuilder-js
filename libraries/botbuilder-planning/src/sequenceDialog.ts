/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog, DialogEvent, DialogContext, DialogConsultation, DialogConsultationDesire } from 'botbuilder-dialogs';
import { PlanningDialog } from './planningDialog';
import { PlanningEventNames, PlanChangeType, PlanningContext, PlanStepState } from './planningContext';

export class SequenceDialog extends PlanningDialog {
    public readonly steps: Dialog[];

    constructor (dialogId?: string, steps?: Dialog[]) {
        super(dialogId);
        this.steps = steps || [];
    }

    protected onComputeID(): string {
        return `sequence(${this.bindingPath()})`;
    }

    public async consultRules(planning: PlanningContext, event: DialogEvent): Promise<DialogConsultation> {
        // Intercept beginDialog event
        if (event.name == PlanningEventNames.beginDialog) {
            return {
                desire: DialogConsultationDesire.shouldProcess,
                processor: async (dc) => {
                    // Initialize sequences plan
                    const changes = this.steps.map((step) => {
                        return {
                            dialogStack: [],
                            dialogId: step.id,
                            options: event.value
                        } as PlanStepState
                    });
                    await planning.doSteps(changes);

                    // Begin plan execution
                    return await this.continuePlan(planning);
                } 
            };
        } else {
            return await super.consultRules(planning, event);
        }
    }
}