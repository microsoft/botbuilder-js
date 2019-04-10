/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogCommand, DialogTurnResult, Dialog, DialogConfiguration } from 'botbuilder-dialogs';
import { ExpressionEngine } from 'botbuilder-expression-parser';
import { Expression } from 'botbuilder-expression';
import { PlanningContext, PlanStepState, PlanChangeType } from '../planningContext';
import { ExpressionDelegate } from './setProperty';

export interface IfConditionConfiguration extends DialogConfiguration {
    /**
     * The conditional expression to evaluate.
     */
    condition?: string;
    
    /**
     * The steps to run if [condition](#condition) returns true.
     */
    steps?: Dialog[];

    /**
     * The steps to run if [condition](#condition) returns false.
     */
    elseSteps?: Dialog[];
}

export class IfCondition extends DialogCommand {
    /**
     * The conditional expression to evaluate.
     */
    public condition: Expression;

    /**
     * The steps to run if [condition](#condition) returns true.
     */
    public steps: Dialog[] = [];

    /**
     * The steps to run if [condition](#condition) returns false.
     */
    public elseSteps: Dialog[] = [];

    /**
     * Creates a new `IfCondition` instance.
     * @param condition The conditional expression to evaluate.
     * @param steps The steps to run if the condition returns true. 
     */
    constructor(condition?: string|Expression|ExpressionDelegate<boolean>, steps?: Dialog[]) {
        super();
        if (condition) { 
            switch (typeof condition) {
                case 'string':
                    this.condition = engine.parse(condition);
                    break; 
                case 'function':
                    this.condition = Expression.Lambda(condition);
                    break;
                default:
                    this.condition = condition as Expression;
                    break;
            }
        }
        if (Array.isArray(steps)) { this.steps = steps }
    }

    protected onComputeID(): string {
        const label = this.condition ? this.condition.toString() : '';
        return `if[${this.hashedLabel(label)}]`;
    }

    public configure(config: IfConditionConfiguration): this {
        const cfg: IfConditionConfiguration = {};
        for (const key in config) {
            switch(key) {
                case 'condition':
                    this.condition = engine.parse(config.condition);
                    break;
                default:
                    cfg[key] = config[key];
                    break;
            }
        }
        return super.configure(cfg);
    }

    public getDependencies(): Dialog[] {
        return this.steps.concat(this.elseSteps);
    }

    public else(steps: Dialog[]): this {
        this.elseSteps = steps;
        return this;
    }

    protected async onRunCommand(planning: PlanningContext, options: object): Promise<DialogTurnResult> {
        // Ensure planning context and condition
        if (!(planning instanceof PlanningContext)) { throw new Error(`${this.id}: should only be used within a planning or sequence dialog.`) }
        if (!this.condition) { throw new Error(`${this.id}: no conditional expression specified.`) }

        // Evaluate expression
        const memory = planning.state.toJSON();
        const { value, error } = this.condition.tryEvaluate(memory);

        // Check for error
        if (error) { throw new Error(`${this.id}: expression error - ${error.toString()}`) }

        // Check for truthy returned value
        const triggered = value ? this.steps : this.elseSteps;

        // Queue up steps that should run after current step
        if (triggered.length > 0) {
            const steps = triggered.map((step) => {
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
}

const engine = new ExpressionEngine();