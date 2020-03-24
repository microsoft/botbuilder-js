/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ExpressionParserInterface, ExpressionEngine } from "adaptive-expressions";
import { TriggerSelector } from "../triggerSelector";
import { OnCondition } from "../conditions";
import { SequenceContext } from "../sequenceContext";

/**
 * Select all rules which evaluate to true.
 */
export class TrueSelector implements TriggerSelector {
    private _conditionals: OnCondition[];
    private _evaluate: boolean;

    /**
     * Gets or sets the expression parser to use.
     */
    public parser: ExpressionParserInterface = new ExpressionEngine()

    initialize(conditionals: OnCondition[], evaluate: boolean): void {
        this._conditionals = conditionals;
        this._evaluate = evaluate;
    }

    select(context: SequenceContext): Promise<number[]> {
        const candidates = [];

        for (let i = 0; i < this._conditionals.length; i++) {
            if (this._evaluate) {
                const conditional = this._conditionals[i];
                const expression = conditional.getExpression(this.parser);
                const { value, error } = expression.tryEvaluate(context.state);
                if (value && !error) {
                    candidates.push(i);
                }
            } else {
                candidates.push(i);
            }
        }

        return Promise.resolve(candidates);
    }

}