/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import bigInt from 'big-integer';
import { EvaluateExpressionDelegate, ExpressionEvaluator, ValueWithError } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { ReturnType } from '../returnType';

/**
 * Return the integer version of a string.
 */
export class Int extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [Int](xref:adaptive-expressions.Int) class.
     */
    constructor() {
        super(ExpressionType.Int, Int.evaluator(), ReturnType.Number, FunctionUtils.validateUnary);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError(
            (args: readonly unknown[]): ValueWithError => {
                let error: string;
                let value: unknown;
                const firstChild = args[0];
                if (bigInt.isInstance(firstChild)) {
                    return { value: firstChild.toJSNumber(), error };
                }
                if (typeof firstChild === 'string') {
                    value = parseInt(firstChild, 10);
                    if (!FunctionUtils.isNumber(value)) {
                        error = `parameter ${args[0]} is not a valid number string.`;
                    }
                } else if (FunctionUtils.isNumber(firstChild)) {
                    value = parseInt(firstChild.toString(), 10);
                }

                return { value, error };
            }
        );
    }
}
