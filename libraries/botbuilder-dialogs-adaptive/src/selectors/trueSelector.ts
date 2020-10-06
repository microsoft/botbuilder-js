/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ExpressionParserInterface, ExpressionParser } from 'adaptive-expressions';
import { TriggerSelector } from '../triggerSelector';
import { OnCondition } from '../conditions';
import { ActionContext } from '../actionContext';

/**
 * Select all rules which evaluate to true.
 */
export class TrueSelector extends TriggerSelector {
    private _conditionals: OnCondition[];
    private _evaluate: boolean;

    /**
     * Gets or sets the expression parser to use.
     */
    public parser: ExpressionParserInterface = new ExpressionParser()

    public initialize(conditionals: OnCondition[], evaluate: boolean): void {
        this._conditionals = conditionals;
        this._evaluate = evaluate;
    }

    public select(actionContext: ActionContext): Promise<OnCondition[]> {
        const candidates: OnCondition[] = [];

        for (let i = 0; i < this._conditionals.length; i++) {
            const conditional = this._conditionals[i];
            if (this._evaluate) {
                const expression = conditional.getExpression(this.parser);
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