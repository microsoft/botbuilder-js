/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { Expression } from '../expression';
import { ReturnType } from '../returnType';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { CommonRegex } from '../commonRegex';
import { Constant } from '../constant';

/**
 * Return true if a given string is matches a specified regular expression pattern.
 */
export class IsMatch extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.IsMatch, IsMatch.evaluator(), ReturnType.Boolean, IsMatch.validator);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError(
            (args: any[]): any => {
                let value = false;
                let error: string;
                if (args[0] === undefined || args[0] === '') {
                    value = false;
                    error = 'regular expression is empty.';
                } else {
                    const regex: RegExp = CommonRegex.CreateRegex(args[1].toString());
                    value = regex.test(args[0].toString());
                }

                return {value, error};
            }, FunctionUtils.verifyStringOrNull);
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 2, 2, ReturnType.String);

        const second: Expression = expression.children[1];
        if (second.returnType === ReturnType.String && second.type === ExpressionType.Constant) {
            CommonRegex.CreateRegex((second as Constant).value.toString());
        }
    }
}