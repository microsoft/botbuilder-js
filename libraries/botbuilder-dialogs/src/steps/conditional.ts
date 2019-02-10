/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogCommand } from '../dialogCommand';
import { DialogContext } from '../dialogContext';
import { DialogTurnResult, Dialog } from '../dialog';
import { CallDialog } from './callDialog';

export type ConditionalExpression = (dc: DialogContext) => Promise<boolean>;

export class Conditional extends DialogCommand {
    private tests: { expression: ConditionalExpression; step: Dialog; }[] = [];

    protected onComputeID(): string {
        const stepList = this.tests.map((test) => test.step.id);
        return `conditional(${stepList.join(',')})`;
    }

    public addTest(expression: ConditionalExpression, step: Dialog): this {
        // Save test to list
        this.tests.push({ expression: expression, step: step });
        
        // Save step to be automatically registered with the DialogSet that the Condition dialog
        // is added to.
        this.steps.push(step);
        
        return this;
    }

    public elseIf(expression: ConditionalExpression, step: Dialog): this {
        this.addTest(expression, step);
        return this;
    }

    public else(step: Dialog): this {
        this.addTest(async (dc) => true, step);
        return this;
    }

    protected async onRunCommand(dc: DialogContext): Promise<DialogTurnResult> {
        // Look for first expression to return true.
        for (let i = 0; i < this.tests.length; i++) {
            const test = this.tests[i];
            const result = await test.expression(dc);
            if (result) {
                // Replace condition with step
                return await dc.replaceDialog(test.step.id);
            }
        }

        // No matching tests so just end
        return await dc.endDialog();
    }

    static if(expression: ConditionalExpression, step: Dialog): Conditional {
        const dialog = new Conditional();
        dialog.addTest(expression, step);
        return dialog;
    }
}
