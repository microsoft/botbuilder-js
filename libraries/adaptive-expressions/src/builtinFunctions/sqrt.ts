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
 * Returns the square root of a specified number.
 */
export class Sqrt extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [SortBy](xref:adaptive-expressions.Sqrt) class.
     */
    constructor() {
        super(ExpressionType.Sqrt, Sqrt.evaluator(), ReturnType.Number, FunctionUtils.validateUnaryNumber);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError((args: any[]): any => {
            let error: string;
            let value: any;
            const originalNumber = Number(args[0]);
            if (originalNumber < 0) {
                error = 'Do not support square root extraction of negative numbers.';
            } else {
                value = Math.sqrt(originalNumber);
            }

            return { value, error };
        }, FunctionUtils.verifyNumber);
    }
}
