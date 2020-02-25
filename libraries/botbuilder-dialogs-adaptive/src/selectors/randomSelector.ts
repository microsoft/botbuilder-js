/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ExpressionParserInterface, ExpressionEngine } from "botframework-expressions";
import { TriggerSelector } from "../triggerSelector";
import { OnCondition } from "../conditions";
import { SequenceContext } from "../sequenceContext";

/**
 * Select a random true rule implementation of TriggerSelector.
 */
export class RandomSelector implements TriggerSelector {
    private _conditionals: OnCondition[];
    private _evaluate: boolean;

    /**
     * Gets or sets the expression parser to use.
     */
    public parser: ExpressionParserInterface = new ExpressionEngine()

    public initialize(conditionals: OnCondition[], evaluate: boolean): void {
        this._conditionals = conditionals;
        this._evaluate = evaluate;
    }

    public select(context: SequenceContext): Promise<number[]> {
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

        const result = [];
        if (candidates.length > 0) {
            const selection = Math.floor(Math.random() * candidates.length);
            result.push(selection);
        }

        return Promise.resolve(result);
    }

}