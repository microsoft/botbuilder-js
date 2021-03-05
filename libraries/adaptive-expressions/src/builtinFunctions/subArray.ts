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
 * Returns a subarray from specified start and end positions. Index values start with the number 0.
 */
export class SubArray extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [SubArray](xref:adaptive-expressions.SubArray) class.
     */
    public constructor() {
        super(ExpressionType.SubArray, SubArray.evaluator, ReturnType.Array, SubArray.validator);
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
                const startExpr: Expression = expression.children[1];
                const startEvaluateResult = startExpr.tryEvaluate(state, options);
                const start = startEvaluateResult.value;
                error = startEvaluateResult.error;

                if (!error && !FunctionUtils.isInteger(start)) {
                    error = `${startExpr} is not an integer.`;
                } else if (start < 0 || start >= arr.length) {
                    error = `${startExpr}=${start} which is out of range for ${arr}`;
                }
                if (!error) {
                    let end: unknown;
                    if (expression.children.length === 2) {
                        end = arr.length;
                    } else {
                        const endExpr: Expression = expression.children[2];
                        const endEvaluateResult = endExpr.tryEvaluate(state, options);
                        end = endEvaluateResult.value;
                        error = endEvaluateResult.error;

                        if (!error && !FunctionUtils.isInteger(end)) {
                            error = `${endExpr} is not an integer`;
                        } else if (end < 0 || end > arr.length) {
                            error = `${endExpr}=${end} which is out of range for ${arr}`;
                        }
                    }
                    if (!error) {
                        result = arr.slice(start as number, end as number);
                    }
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
        FunctionUtils.validateOrder(expression, [ReturnType.Number], ReturnType.Array, ReturnType.Number);
    }
}
