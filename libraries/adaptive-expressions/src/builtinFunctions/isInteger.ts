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
 * Return true if a given input is an integer number. Due to the alignment between C# and JavaScript, a number with a zero residue of its modulo 1 will be treated as an integer number.
 */
export class IsInteger extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [IsInteger](xref:adaptive-expressions.IsInteger) class.
     */
    constructor() {
        super(ExpressionType.IsInteger, IsInteger.evaluator(), ReturnType.Boolean, FunctionUtils.validateUnary);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply(
            (args: any[]): boolean => FunctionUtils.isNumber(args[0]) && Number.isInteger(args[0])
        );
    }
}
