/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { CommonRegex } from '../commonRegex';
import { Constant } from '../constant';
import { Expression } from '../expression';
import { EvaluateExpressionDelegate, ExpressionEvaluator } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { ReturnType } from '../returnType';

/**
 * Return true if a given string matches a specified regular expression pattern.
 */
export class IsMatch extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the `IsMatch` class.
     */
    public constructor() {
        super(ExpressionType.IsMatch, IsMatch.evaluator(), ReturnType.Boolean, IsMatch.validator);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError((args: any[]): any => {
            let value = false;
            let error: string;
            if (args[0] === undefined || args[0] === '') {
                value = false;
                error = 'regular expression is empty.';
            } else {
                const regex: RegExp = CommonRegex.CreateRegex(args[1].toString());
                value = regex.test(args[0].toString());
            }

            return { value, error };
        }, FunctionUtils.verifyStringOrNull);
    }

    /**
     * @private
     */
    private static validator(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 2, 2, ReturnType.String);

        const second: Expression = expression.children[1];
        if (second.returnType === ReturnType.String && second.type === ExpressionType.Constant) {
            CommonRegex.CreateRegex((second as Constant).value.toString());
        }
    }
}
