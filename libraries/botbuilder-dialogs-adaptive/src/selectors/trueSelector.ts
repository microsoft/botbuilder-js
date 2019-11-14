/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IExpressionParser, ExpressionEngine } from "botframework-expressions";
import { ITriggerSelector } from "../triggerSelector";
import { OnCondition } from "../conditions";
import { SequenceContext } from "../sequenceContext";

/**
 * Select all rules which evaluate to true.
 */
export class TrueSelector implements ITriggerSelector {
    private _conditionals: OnCondition[];
    private _evaluate: boolean;
    private _parser: IExpressionParser = new ExpressionEngine();

    initialize(conditionals: OnCondition[], evaluate: boolean): void {
        this._conditionals = conditionals;
        this._evaluate = evaluate;
    }

    select(context: SequenceContext): Promise<number[]> {
        const candidates = [];

        for (let i = 0; i < this._conditionals.length; i++) {
            if (this._evaluate) {
                const conditional = this._conditionals[i];
                const expression = conditional.getExpression(this._parser);
                const { value, error } = expression.tryEvaluate(context.state);
                if (value && error == null) {
                    candidates.push(i);
                }
            } else {
                candidates.push(i);
            }
        }

        return Promise.resolve(candidates);
    }

}