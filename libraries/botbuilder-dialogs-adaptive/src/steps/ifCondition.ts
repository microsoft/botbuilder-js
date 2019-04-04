/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogCommand, DialogTurnResult, Dialog, DialogConfiguration } from 'botbuilder-dialogs';
import { PlanningContext, PlanStepState, PlanChangeType } from '../planningContext';

export interface IfConditionConfiguration extends DialogConfiguration {
    /**
     * The expression to evaluate.
     */
    expression?: string;
    
    /**
     * The steps to run if [expression](#expression) returns true.
     */
    steps?: Dialog[];
}

export class IfCondition extends DialogCommand {

    /**
     * The expression to evaluate.
     */
    public expression: string;

    /**
     * The steps to run if [expression](#expression) returns true.
     */
    public readonly steps: Dialog[] = [];

    /**
     * Creates a new `IfCondition` instance.
     * @param expression The expression to evaluate.
     * @param steps The steps to run if the expression returns true. 
     */
    constructor();
    constructor(expression: string, steps: Dialog[]);
    constructor(expression?: string, steps?: Dialog[]) {
        super();
        if (expression) { this.expression = expression; }
        if (Array.isArray(steps)) { Array.prototype.push.apply(this.steps, steps) }
    }

    protected onComputeID(): string {
        const stepList = this.steps.map((step) => step.id).join(',');
        return `if[${this.hashedLabel(stepList)}]`;
    }

    public configure(config: IfConditionConfiguration): this {
        return super.configure(config);
    }

    public getDependencies(): Dialog[] {
        return this.steps;
    }

    protected async onRunCommand(planning: PlanningContext, options: object): Promise<DialogTurnResult> {
        // Ensure planning context
        if (!(planning instanceof PlanningContext)) { throw new Error(`IfCondition: should only be used within a planning or sequence dialog.`) }

        // Look for first expression to return true.
        if (this.isTruthy(planning, this.expression)) {
            // Queue up steps that should run after current step
            const steps = this.steps.map((step) => {
                return {
                    dialogStack: [],
                    dialogId: step.id,
                    options: options
                } as PlanStepState
            });
            await planning.queueChanges({ changeType: PlanChangeType.doSteps, steps: steps });
        }

        return await planning.endDialog();
    }

    protected isTruthy(planning: PlanningContext, expression?: string): boolean {
        if (expression) {
            console.log(expression);
            // Check for '!' prefix
            let result = true;
            if (expression[0] == '!') {
                result = false;
                expression = expression.substr(1);
            }
            const value = planning.state.getValue(expression);
            if (Array.isArray(value)) {
                return value.length > 0 ? result : !result;
            } else if (typeof value == 'object') {
                for (const key in value) {
                    if (value.hasOwnProperty(key)) {
                        return result;
                    }
                }

                return !result;
            } else {
                console.log(`value: ${value}`)
                return !!value ? result : !result;
            }
        } else {
            return true;
        }
    }
}
