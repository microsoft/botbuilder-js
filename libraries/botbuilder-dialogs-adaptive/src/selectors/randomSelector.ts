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
 * Select a random true rule implementation of ITriggerSelector.
 */
export class RandomSelector implements ITriggerSelector {
    private _conditionals: OnCondition[];
    private _evaluate: boolean;
    private _parser: IExpressionParser = new ExpressionEngine();

    public initialize(conditionals: OnCondition[], evaluate: boolean): void {
        this._conditionals = conditionals;
        this._evaluate = evaluate;
    }

    public select(context: SequenceContext): Promise<number[]> {
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

        const result = [];
        if (candidates.length > 0) {
            const selection = Math.floor(Math.random() * candidates.length);
            result.push(selection);
        }

        return Promise.resolve(result);
    }

}