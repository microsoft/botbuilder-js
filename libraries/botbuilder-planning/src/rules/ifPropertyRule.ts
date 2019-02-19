/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog, DialogContextState, DialogEvent } from 'botbuilder-dialogs';
import { PlanningRule } from './planningRule';
import { PlanningContext, PlanChangeList } from '../planningContext';

export interface IfPropertyRuleCondition {
    expression: (state: DialogContextState) => Promise<boolean>;
    rules: PlanningRule[];
}

/**
 * This rule will conditionally run other rules based upon a state expression being matched.
 * 
 * @remarks
 * If an `expression` and `rules` are passed to the rules constructor, the expression will become 
 * the rules initial "if" test.  Additional tests can then be added using the fluent [elseIf()](#elseif)
 * and [else()](#else) methods.
 */
export class IfPropertyRule implements PlanningRule {
    /**
     * List of conditional expressions to evaluate and the rules to then run.
     * 
     * @remarks
     * The conditional expressions will be tested in order. Once an expression returns true, 
     * its associated block of rules will then be evaluated.
     */
    public conditionals: IfPropertyRuleCondition[] = [];

    /**
     * Creates a new `IfPropertyRule` instance.
     * @param expression The expression to test for the rules "if" clause.
     * @param rules The rules to evaluate if the expression returns true. 
     */
    constructor();
    constructor(expression: (state: DialogContextState) => Promise<boolean>, rules: PlanningRule[]);
    constructor(expression?: (state: DialogContextState) => Promise<boolean>, rules?: PlanningRule[]) {
        if (expression && rules) {
            this.conditionals.push({ expression: expression, rules: rules });
        }
    }

    public get steps(): Dialog[] {
        const steps: Dialog[] = [];
        this.conditionals.forEach((c) => c.rules.forEach((r) => r.steps.forEach((s) => steps.push(s))));
        return steps;
    }

    public async evaluate(planning: PlanningContext, event: DialogEvent): Promise<PlanChangeList[]|undefined> {
        // Find first matching conditional
        const changes: PlanChangeList[] = [];
        for (let i = 0; i < this.conditionals.length; i++) {
            const conditional = this.conditionals[i];
            if (await conditional.expression(planning.state)) {
                // Evaluate child rules
                for (let j = 0; j < conditional.rules.length; j++) {
                    const change = await conditional.rules[j].evaluate(planning, event);
                    if (change !== undefined) {
                        Array.prototype.push.apply(changes, change);
                    }
                }
                break;
            }
        }
        return changes.length > 0 ? changes : undefined;
    }

    /**
     * Adds an additional expression to test and associated block of rules to evaluate if the
     * expression returns true.
     * @param expression An expression to test.
     * @param rules The rules to evaluate if the expression returns true. 
     */
    public elseIf(expression: (state: DialogContextState) => Promise<boolean>, rules: PlanningRule[]): this {
        this.conditionals.push({ expression: expression, rules: rules });
        return this;
    }

    /**
     * Adds a default block of rules to evaluate if the other conditional expressions return false.
     * 
     * @remarks
     * You should not make any further calls to [elseIf()](#elseif) after calling `else()` as they 
     * will never be evaluated. 
     * @param rules The rules to evaluate if all expressions before the `else()` return false. 
     */
    public else(rules: PlanningRule[]): this {
        this.conditionals.push({ expression: async (state) => true, rules: rules });
        return this;
    }
}