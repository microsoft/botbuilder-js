/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType } from '../returnType';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';

/**
 * Return the lowest value from a set of numbers or an array.
 */
export class Min extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.Min, Min.evaluator(), ReturnType.Number, FunctionUtils.validateAtLeastOne);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply((args: any[]): number => {
            let result = Number.POSITIVE_INFINITY;
            if (args.length === 1) {
                if (Array.isArray(args[0])) {
                    for (const value of args[0]) {
                        result = Math.min(result, value);
                    }
                } else {
                    result = Math.min(result, args[0]);
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