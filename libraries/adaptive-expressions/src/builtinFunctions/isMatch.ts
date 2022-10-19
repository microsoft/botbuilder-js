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
     * Initializes a new instance of the [IsMatch](xref:adaptive-expressions.IsMatch) class.
     */
    constructor() {
        super(ExpressionType.IsMatch, IsMatch.evaluator(), ReturnType.Boolean, IsMatch.validator);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError((args: any[]): any => {
            const regex: RegExp = CommonRegex.CreateRegex(args[1].toString());
            const inputString = args[0] ? args[0].toString() : '';
            const value = regex.test(inputString);
            return { value, undefined };
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
