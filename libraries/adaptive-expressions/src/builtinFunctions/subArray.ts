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
 * Returns a subarray from specified start and end positions. Index values start with the number 0.
 */
export class SubArray extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [SubArray](xref:adaptive-expressions.SubArray) class.
     */
    constructor() {
        super(ExpressionType.SubArray, SubArray.evaluator, ReturnType.Array, SubArray.validator);
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
                } else if (start < 0 || start > arr.length) {
                    error = `${startExpr}=${start} which is out of range for ${arr}`;
                }
                if (!error) {
                    let end: number;
                    if (expression.children.length === 2) {
                        end = arr.length;
                    } else {
                        const endExpr: Expression = expression.children[2];
                        ({ value: end, error } = endExpr.tryEvaluate(state, options));
                        if (!error && !Number.isInteger(end)) {
                            error = `${endExpr} is not an integer`;
                        } else if (end < 0 || end > arr.length) {
                            error = `${endExpr}=${end} which is out of range for ${arr}`;
                        }
                    }
                    if (!error) {
                        result = arr.slice(start, end);
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
