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
    constructor() {
        super(ExpressionType.RemoveProperty, RemoveProperty.evaluator(), ReturnType.Object, RemoveProperty.validator);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply((args: any[]): any => {
            const temp: any = args[0];
            delete temp[String(args[1])];

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
