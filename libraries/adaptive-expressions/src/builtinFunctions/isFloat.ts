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
 * Return true if a given input is a floating-point number.
 * Due to the alignment between C# and JavaScript, a number with an non-zero residue of its modulo 1 will be treated as a floating-point number.
 */
export class IsFloat extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [IsFloat](xref:adaptive-expressions.IsFloat) class.
     */
    constructor() {
        super(ExpressionType.IsFloat, IsFloat.evaluator(), ReturnType.Boolean, FunctionUtils.validateUnary);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply(
            (args: any[]): boolean => FunctionUtils.isNumber(args[0]) && !Number.isInteger(args[0])
        );
    }
}
