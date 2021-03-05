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
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';
import { ReturnType } from '../returnType';

/**
 * Remove items from the front of a collection, and return all the other items.
 */
export class Skip extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [Skip](xref:adaptive-expressions.Skip) class.
     */
    public constructor() {
        super(ExpressionType.Skip, Skip.evaluator, ReturnType.Array, Skip.validator);
    }

    /**
     * @private
     */
    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): ValueWithError {
        let result: unknown;
        const { value: arr, error: childrenError } = expression.children[0].tryEvaluate(state, options);
        let error = childrenError;
        if (!error) {
            if (Array.isArray(arr)) {
                let start: number;

                const startExpr: Expression = expression.children[1];
                const evaluateResult = startExpr.tryEvaluate(state, options);
                start = evaluateResult.value as number;
                error = evaluateResult.error;

                if (!error && !FunctionUtils.isInteger(start)) {
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
