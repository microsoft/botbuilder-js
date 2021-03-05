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
 * Remove a property from an object and return the updated object.
 */
export class RemoveProperty extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [RemoveProperty](xref:adaptive-expressions.RemoveProperty) class.
     */
    public constructor() {
        super(ExpressionType.RemoveProperty, RemoveProperty.evaluator(), ReturnType.Object, RemoveProperty.validator);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply((args: readonly unknown[]): unknown => {
            const temp: Record<string, unknown> = args[0] as Record<string, unknown>;
            delete temp[args[1] as string];

            return temp;
        });
    }

    /**
     * @private
     */
    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, undefined, ReturnType.Object, ReturnType.String);
    }
}
