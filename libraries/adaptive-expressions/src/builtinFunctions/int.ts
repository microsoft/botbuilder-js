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
 * Return the integer version of a string.
 */
export class Int extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the `Int` class.
     */
    public constructor() {
        super(ExpressionType.Int, Int.evaluator(), ReturnType.Number, FunctionUtils.validateUnary);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError((args: any[]): any => {
            let error: string;
            const value: number = parseInt(args[0], 10);
            if (!FunctionUtils.isNumber(value)) {
                error = `parameter ${args[0]} is not a valid number string.`;
            }

            return { value, error };
        });
    }
}
