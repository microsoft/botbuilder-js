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

    protected onInstallDependencies(): void {
        this.steps.forEach((step) => this.addDialog(step));        
        super.onInstallDependencies();
    }

    public async evaluateRules(planning: PlanningContext, event: DialogEvent): Promise<boolean> {
        // Intercept beginDialog event
        if (event.name == PlanningEventNames.beginDialog) {
            // Queue up sequences plan
            const steps = this.steps.map((step) => {
                return {
                    dialogStack: [],
                    dialogId: step.id,
                    options: event.value
                } as PlanStepState
            });
            planning.queueChanges({ changeType: PlanChangeType.doSteps, steps: steps });
            return true;
        } else {
            return await super.evaluateRules(planning, event);
        }
    }
}
