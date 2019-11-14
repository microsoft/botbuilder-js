/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ExpressionEngine } from "botframework-expressions";
import { OnCondition } from "../conditions/onCondition";
import { SequenceContext } from "../sequenceContext";
import { TriggerSelector } from "../triggerSelector";

/**
 * Select the first true rule implementation of TriggerSelector
 */
export class FirstSelector implements TriggerSelector {
    private _conditionals: OnCondition[];
    private _evaluate: boolean;
    private readonly _parser: ExpressionEngine = new ExpressionEngine();

    public initialize(conditionals: OnCondition[], evaluate: boolean) {
        this._conditionals = conditionals;
        this._evaluate = evaluate;
    }

    public select(context: SequenceContext): Promise<number[]> {
        let selection = -1;
        if (this._evaluate) {
            for (let i = 0; i < this._conditionals.length; i++) {
                const conditional = this._conditionals[i];
                const expression = conditional.getExpression(this._parser);
                const { value, error } = expression.tryEvaluate(context.state);
                if (value && error == null) {
                    selection = i;
                    break;
                }
            }
        } else {
            if (this._conditionals.length > 0) {
                selection = 0;
            }
        }

        const result = [];
        if (selection != -1) {
            result.push(selection);
        }

        return Promise.resolve(result);
    }
}