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
 * Return items from the front of an array or take the specific prefix from a string.
 */
export class Take extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [Take](xref:adaptive-expressions.Take) class.
     */
    public constructor() {
        super(ExpressionType.Take, Take.evaluator, ReturnType.Array | ReturnType.String, Take.validator);
    }

    /**
     * @private
     */
    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): ValueWithError {
        let result: unknown;
        const { value: arr, error: childrenError } = expression.children[0].tryEvaluate(state, options);
        let error = childrenError;

        if (!error) {
            if (Array.isArray(arr) || typeof arr === 'string') {
                const startExpr: Expression = expression.children[1];
                const startEvaluateResult = startExpr.tryEvaluate(state, options);
                let start = startEvaluateResult.value;
                error = startEvaluateResult.error;

                if (!error && !FunctionUtils.isInteger(start)) {
                    error = `${startExpr} is not an integer.`;
                }

                if (!error) {
                    start = Math.max(start as number, 0);
                    result = arr.slice(0, start as number);
                }
            } else {
                error = `${expression.children[0]} is not array or string.`;
            }
        }

        return { value: result, error };
    }

    /**
     * @private
     */
    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [], ReturnType.Array | ReturnType.String, ReturnType.Number);
    }
}
