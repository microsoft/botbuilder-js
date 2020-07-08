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

export class AddProperty extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.AddProperty, AddProperty.evaluator(), ReturnType.Object, AddProperty.validator);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError(
            (args: any[]): any => {
                let error: string;
                const temp: any = args[0];
                const prop = String(args[1]);
                if (prop in temp) {
                    error = `${prop} already exists`;
                } else {
                    temp[String(args[1])] = args[2];
                }

                return {value: temp, error};
            });
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, undefined, ReturnType.Object, ReturnType.String, ReturnType.Object);
    }
}