/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression } from '../expression';
import { EvaluateExpressionDelegate, ExpressionEvaluator } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { ReturnType } from '../returnType';

/**
 * Remove all duplicates from an array.
 */
export class Unique extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [Unique](xref:adaptive-expressions.Unique) class.
     */
    constructor() {
        super(ExpressionType.Unique, Unique.evaluator(), ReturnType.Array, Unique.validator);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply((args: any[]): any[] => [...new Set(args[0])], FunctionUtils.verifyList);
    }

    /**
     * @private
     */
    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [], ReturnType.Array);
    }
}
