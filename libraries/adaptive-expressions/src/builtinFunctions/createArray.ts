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
 * Return an array from multiple inputs.
 */
export class CreateArray extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [CreateArray](xref:adaptive-expressions.CreateArray) class.
     */
    constructor() {
        super(ExpressionType.CreateArray, CreateArray.evaluator(), ReturnType.Array);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply((args: any[]): any[] => Array.from(args));
    }
}
