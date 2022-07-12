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
 * Return true if a given input is a complex object or return false if it is a primitive object.
 * Primitive objects include strings, numbers, and Booleans;
 * complex types, contain properties.
 */
export class IsObject extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [IsObject](xref:adaptive-expressions.IsObject) class.
     */
    constructor() {
        super(ExpressionType.IsObject, IsObject.evaluator(), ReturnType.Boolean, FunctionUtils.validateUnary);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply((args: any[]): boolean => typeof args[0] === 'object');
    }
}
