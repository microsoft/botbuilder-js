/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogCommand, DialogTurnResult, Dialog, DialogConfiguration } from 'botbuilder-dialogs';
import { PlanningContext, PlanStepState, PlanChangeType } from '../planningContext';

export interface IfConfiguration extends DialogConfiguration {
    conditionals?: IfConditional[];
}

export interface IfConditional {
    property?: string;
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
    public conditionals: IfConditional[] = [];

    /**
     * Creates a new `IfProperty` instance.
     * @param property The property to test for the steps "if" clause.
     * @param steps The steps to run if the expression returns true. 
     */
    constructor();
    constructor(property: string, steps: Dialog[]);
    constructor(property?: string, steps?: Dialog[]) {
        super();
        if (property && steps) {
            this.conditionals.push({ property: property, steps: steps });
        }
    }

    protected onComputeID(): string {
        const stepList = this.getDependencies().map((step) => step.id).join(',');
        return `if[${this.hashedLabel(stepList)}]`;
    }

    public configure(config: IfConfiguration): this {
        return super.configure(config);
    }

    public getDependencies(): Dialog[] {
        const steps: Dialog[] = [];
        this.conditionals.forEach((c) => c.steps.forEach((s) => steps.push(s)));
        return steps;
    }

    /**
     * Adds an additional expression to test and associated block of steps to run if the
     * expression returns true.
     * @param property An in-memory property to test.
     * @param steps The steps to run if the expression returns true. 
     */
    public elseIf(property: string, steps: Dialog[]): this {
        this.conditionals.push({ property: property, steps: steps });
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
        this.conditionals.push({ steps: steps });
        return this;
    }  

    protected async onRunCommand(planning: PlanningContext, options: object): Promise<DialogTurnResult> {
        // Ensure planning context
        if (!(planning instanceof PlanningContext)) { throw new Error(`IfProperty: should only be used within a planning or sequence dialog.`) }

        // Look for first expression to return true.
        for (let i = 0; i < this.conditionals.length; i++) {
            const conditional = this.conditionals[i];
            const result = this.isTruthy(planning, conditional.property);
            if (result) {
                // Create change list
                const steps = conditional.steps.map((step) => {
                    return {
                        dialogStack: [],
                        dialogId: step.id,
                        options: options
                    } as PlanStepState
                });

                // Queue up steps that should run after current step
                await planning.queueChanges({ changeType: PlanChangeType.doSteps, steps: steps });
                break;
            }
        }

        return await planning.endDialog();
    }

    protected isTruthy(planning: PlanningContext, property?: string): boolean {
        if (property) {
            console.log(property);
            // Check for '!' prefix
            let result = true;
            if (property[0] == '!') {
                result = false;
                property = property.substr(1);
            }
            const value = planning.state.getValue(property);
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
