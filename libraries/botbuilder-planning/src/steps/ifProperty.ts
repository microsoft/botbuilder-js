/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogCommand, DialogTurnResult, Dialog, DialogContext, DialogContextState } from 'botbuilder-dialogs';
import { PlanningContext, PlanStepState } from '../planningContext';

export interface IfPropertyCondition {
    expression: (state: DialogContextState) => Promise<boolean>;
    steps: Dialog[];
}

export class IfProperty extends DialogCommand {
    /**
     * List of conditional expressions to evaluate and the steps to then run.
     * 
     * @remarks
     * The conditional expressions will be tested in order. Once an expression returns true, 
     * its associated block of steps will then be added to the plan immediately after the 
     * current step.
     */
    private conditionals: IfPropertyCondition[] = [];

    /**
     * Creates a new `IfProperty` instance.
     * @param expression The expression to test for the steps "if" clause.
     * @param steps The steps to run if the expression returns true. 
     */
    constructor();
    constructor(expression: (state: DialogContextState) => Promise<boolean>, steps: Dialog[]);
    constructor(expression?: (state: DialogContextState) => Promise<boolean>, steps?: Dialog[]) {
        super();
        if (expression && steps) {
            this.conditionals.push({ expression: expression, steps: steps });
        }
    }

    protected onComputeID(): string {
        const stepList = this.steps.map((step) => step.id);
        return `conditional(${stepList.join(',')})`;
    }

    public get steps(): Dialog[] {
        const steps: Dialog[] = [];
        this.conditionals.forEach((c) => c.steps.forEach((s) => steps.push(s)));
        return steps;
    }

    /**
     * Adds an additional expression to test and associated block of steps to run if the
     * expression returns true.
     * @param expression An expression to test.
     * @param steps The steps to run if the expression returns true. 
     */
    public elseIf(expression: (state: DialogContextState) => Promise<boolean>, steps: Dialog[]): this {
        this.conditionals.push({ expression: expression, steps: steps });
        return this;
    }

    /**
     * Adds a default block of steps to run if the other conditional expressions return false.
     * 
     * @remarks
     * You should not make any further calls to [elseIf()](#elseif) after calling `else()` as they 
     * will never be evaluated. 
     * @param steps The steps to run if all expressions before the `else()` return false. 
     */
    public else(steps: Dialog[]): this {
        this.conditionals.push({ expression: async (state) => true, steps: steps });
        return this;
    }  

    protected async onRunCommand(planning: PlanningContext, options: object): Promise<DialogTurnResult> {
        // Ensure planning context
        if (!(planning instanceof PlanningContext)) { throw new Error(`IfProperty: should only be used within a planning or sequence dialog.`) }

        // Look for first expression to return true.
        for (let i = 0; i < this.conditionals.length; i++) {
            const conditional = this.conditionals[i];
            const result = await conditional.expression(planning.state);
            if (result) {
                // Create change list
                const steps = conditional.steps.map((step) => {
                    return {
                        dialogStack: [],
                        dialogId: step.id,
                        options: options
                    } as PlanStepState
                })

                // Do steps after current step
                await planning.doStepsAfter(0, steps);
            }
        }

        return await planning.endDialog();
    }
}
