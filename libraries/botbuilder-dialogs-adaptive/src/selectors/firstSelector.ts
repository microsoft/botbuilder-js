/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { OnCondition } from '../conditions/onCondition';
import { TriggerSelector } from '../triggerSelector';
import { ActionContext } from '../actionContext';

/**
 * Select the first true rule implementation of TriggerSelector
 */
export class FirstSelector extends TriggerSelector {
    static $kind = 'Microsoft.FirstSelector';

    private _conditionals: OnCondition[];
    private _evaluate: boolean;

    /**
     * Initialize the selector with the set of rules.
     *
     * @param conditionals Possible rules to match.
     * @param evaluate A boolean representing if rules should be evaluated on select.
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
        let selection: OnCondition;
        let lowestPriority = Number.MAX_SAFE_INTEGER;

        if (this._evaluate) {
            for (let i = 0; i < this._conditionals.length; i++) {
                const conditional = this._conditionals[i];
                const expression = conditional.getExpression();
                const { value, error } = expression.tryEvaluate(actionContext.state);
                if (value && !error) {
                    const priority = conditional.currentPriority(actionContext);
                    if (priority >= 0 && priority < lowestPriority) {
                        selection = conditional;
                        lowestPriority = priority;
                    }
                }
            }
        } else {
            for (let i = 0; i < this._conditionals.length; i++) {
                const conditional = this._conditionals[i];
                const priority = conditional.currentPriority(actionContext);
                if (priority >= 0 && priority < lowestPriority) {
                    selection = conditional;
                    lowestPriority = priority;
                }
            }
        }

        const result = [];
        if (selection) {
            result.push(selection);
        }

        return Promise.resolve(result);
    }
}
