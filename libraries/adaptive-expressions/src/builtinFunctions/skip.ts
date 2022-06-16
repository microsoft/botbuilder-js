/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression } from '../expression';
import { ExpressionEvaluator, ValueWithError } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { Options } from '../options';
import { ReturnType } from '../returnType';

/**
 * Remove items from the front of a collection, and return all the other items.
 */
export class Skip extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [Skip](xref:adaptive-expressions.Skip) class.
     */
    constructor() {
        super(ExpressionType.Skip, Skip.evaluator, ReturnType.Array, Skip.validator);
    }

    /**
     * @private
     */
    private static evaluator(expression: Expression, state: any, options: Options): ValueWithError {
        let result: any;
        const { value: arr, error: childrenError } = expression.children[0].tryEvaluate(state, options);
        let error = childrenError;
        if (!error) {
            if (Array.isArray(arr)) {
                let start: number;

                const startExpr: Expression = expression.children[1];
                ({ value: start, error } = startExpr.tryEvaluate(state, options));
                if (!error && !Number.isInteger(start)) {
                    error = `${startExpr} is not an integer.`;
                }

                if (!error) {
                    start = Math.max(start, 0);
                    result = arr.slice(start);
                }
            } else {
                error = `${expression.children[0]} is not array.`;
            }
        }

        return { value: result, error };
    }

    /**
     * @private
     */
    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [], ReturnType.Array, ReturnType.Number);
    }
}
