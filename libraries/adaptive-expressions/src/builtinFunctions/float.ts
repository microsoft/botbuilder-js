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
 * Convert the string version of a floating-point number to a floating-point number.
 */
export class Float extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [Float](xref:adaptive-expressions.Float) class.
     */
    public constructor() {
        super(ExpressionType.Float, Float.evaluator(), ReturnType.Number, FunctionUtils.validateUnary);
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
                    value = parseFloat(firstChild);
                    if (!FunctionUtils.isNumber(value)) {
                        error = `parameter ${args[0]} is not a valid number string.`;
                    }
                } else if (FunctionUtils.isNumber(firstChild)) {
                    value = firstChild;
                }

                return { value, error };
            }
        );
    }
}
