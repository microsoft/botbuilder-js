/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { PlanningDialog } from './planningDialog';
import { Dialog, DialogEvent } from '../dialog';
import { DialogContext } from '../dialogContext';
import { PlanningEventNames, PlanChangeList, PlanChange, PlanChangeType } from './planningContext';

export class SequenceDialog extends PlanningDialog {
    public readonly steps: Dialog[] = [];

    protected onComputeID(): string {
        return `sequence(${this.bindingPath()})`;
    }

    public do(...steps: Dialog[]): this {
        steps.forEach((step) => {
            this.addDialog(step);
            this.steps.push(step);
        });
        return this;
    }

    public async onDialogEvent(dc: DialogContext, event: DialogEvent): Promise<boolean> {
        // Intercept beginDialog event
        if (event.name == PlanningEventNames.beginDialog) {
            // Create change list
            const changes = this.steps.map((step) => {
                return {
                    type: PlanChangeType.doNow,
                    dialogId: step.id
                } as PlanChange
            });

            // Apply plan changes
            const planning = this.createPlanningContext(dc, event);
            await planning.applyChanges({ changes: changes });
            return true;
        } else {
            return await super.onDialogEvent(dc, event);
        }
    }
}