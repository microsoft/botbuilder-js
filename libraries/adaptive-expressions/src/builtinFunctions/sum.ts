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
 * Return the result from adding numbers in an array.
 */
export class Sum extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [Sum](xref:adaptive-expressions.Sum) class.
     */
    constructor() {
        super(ExpressionType.Sum, Sum.evaluator(), ReturnType.Number, Sum.validator);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply(
            (args: any[]): number => args[0].reduce((x: number, y: number): number => x + y),
            FunctionUtils.verifyNumericList
        );
    }

    /**
     * @private
     */
    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [], ReturnType.Array);
    }
}
