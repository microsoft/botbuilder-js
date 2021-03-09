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
 * Set the value of an object's property and return the updated object.
 */
export class SetProperty extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [SetProperty](xref:adaptive-expressions.SetProperty) class.
     */
    public constructor() {
        super(ExpressionType.SetProperty, SetProperty.evaluator(), ReturnType.Object, SetProperty.validator);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply((args: readonly unknown[]): unknown => {
            const firstChild = args[0];
            const secondChild = args[1];

            if (typeof firstChild === 'object' && typeof secondChild === 'string') {
                firstChild[secondChild] = args[2];
            }

            return firstChild;
        });
    }

    /**
     * @private
     */
    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, undefined, ReturnType.Object, ReturnType.String, ReturnType.Object);
    }
}
