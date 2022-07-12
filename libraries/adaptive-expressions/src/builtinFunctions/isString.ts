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
 * Return true if a given input is a string.
 */
export class IsString extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [IsString](xref:adaptive-expressions.IsString) class.
     */
    constructor() {
        super(ExpressionType.IsString, IsString.evaluator(), ReturnType.Boolean, FunctionUtils.validateUnary);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply((args: any[]): boolean => typeof args[0] === 'string');
    }
}
