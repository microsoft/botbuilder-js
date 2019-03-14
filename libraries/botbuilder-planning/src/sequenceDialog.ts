/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog, DialogEvent } from 'botbuilder-dialogs';
import { RuleDialog } from './ruleDialog';
import { RuleDialogEventNames, PlanChangeType, PlanningContext, PlanStepState } from './planningContext';

export class SequenceDialog extends RuleDialog {
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

    protected async evaluateRules(planning: PlanningContext, event: DialogEvent): Promise<boolean> {
        // Intercept beginDialog event
        if (event.name == RuleDialogEventNames.beginDialog) {
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
