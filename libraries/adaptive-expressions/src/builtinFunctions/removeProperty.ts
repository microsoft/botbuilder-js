/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { ReturnType, Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';

/**
 * Remove a property from an object and return the updated object.
 */
export class RemoveProperty extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.RemoveProperty, RemoveProperty.evaluator(), ReturnType.Object, RemoveProperty.validator);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply(
            (args: any[]): any => {
                const temp: any = args[0];
                delete temp[String(args[1])];

                return temp;
            });
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, undefined, ReturnType.Object, ReturnType.String);
    }
}