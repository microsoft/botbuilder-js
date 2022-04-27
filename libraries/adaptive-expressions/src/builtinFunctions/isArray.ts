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
 * Return true if a given input is an array.
 */
export class IsArray extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [IsArray](xref:adaptive-expressions.IsArray) class.
     */
    constructor() {
        super(ExpressionType.IsArray, IsArray.evaluator(), ReturnType.Boolean, FunctionUtils.validateUnary);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply((args: any[]): boolean => Array.isArray(args[0]));
    }
}
