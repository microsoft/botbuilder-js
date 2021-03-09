/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { EvaluateExpressionDelegate, ExpressionEvaluator } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { ReturnType } from '../returnType';

/**
 * Return the lowest value from a set of numbers in an array.
 */
export class Min extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [Min](xref:adaptive-expressions.Min) class.
     */
    public constructor() {
        super(ExpressionType.Min, Min.evaluator(), ReturnType.Number, FunctionUtils.validateAtLeastOne);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply((args: readonly number[] | number[][]): number => {
            let result = Number.POSITIVE_INFINITY;
            const firstChild = args[0];
            if (args.length === 1) {
                if (Array.isArray(firstChild)) {
                    for (const value of firstChild) {
                        result = Math.min(result, value);
                    }
                } else {
                    result = Math.min(result, firstChild);
                }
            } else {
                for (const arg of args) {
                    if (Array.isArray(arg)) {
                        for (const value of arg) {
                            result = Math.min(result, value);
                        }
                    } else {
                        result = Math.min(result, arg);
                    }
                }
            }

            return result;
        }, FunctionUtils.verifyNumberOrNumericList);
    }
}
