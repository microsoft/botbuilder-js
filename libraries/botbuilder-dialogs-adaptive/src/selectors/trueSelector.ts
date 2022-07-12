/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TriggerSelector } from '../triggerSelector';
import { OnCondition } from '../conditions';
import { ActionContext } from '../actionContext';

/**
 * Select all rules which evaluate to true.
 */
export class TrueSelector extends TriggerSelector {
    static $kind = 'Microsoft.TrueSelector';

    private _conditionals: OnCondition[];
    private _evaluate: boolean;

    /**
     * Initialize the selector with the set of rules.
     *
     * @param conditionals Possible rules to match.
     * @param evaluate True if rules should be evaluated on select.
     */
    initialize(conditionals: OnCondition[], evaluate: boolean): void {
        this._conditionals = conditionals;
        this._evaluate = evaluate;
    }

    /**
     * Select the best rule to execute.
     *
     * @param actionContext Dialog context for evaluation.
     * @returns A Promise with a number array.
     */
    select(actionContext: ActionContext): Promise<OnCondition[]> {
        const candidates: OnCondition[] = [];

        for (let i = 0; i < this._conditionals.length; i++) {
            const conditional = this._conditionals[i];
            if (this._evaluate) {
                const expression = conditional.getExpression();
                const { value, error } = expression.tryEvaluate(actionContext.state);
                if (value && !error) {
                    candidates.push(conditional);
                }
            } else {
                candidates.push(conditional);
            }
        }

        return Promise.resolve(candidates);
    }
}
