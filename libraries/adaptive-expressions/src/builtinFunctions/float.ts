/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

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
            const value: number = parseFloat(String(args[0]));
            if (!FunctionUtils.isNumber(value)) {
                error = `parameter ${args[0]} is not a valid number string.`;
            }

            return { value, error };
        });
    }
}
