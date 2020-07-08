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
 * Return an array that contains substrings, separated by commas, based on the specified delimiter character in the original string.
 */
export class Split extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.Split, Split.evaluator(), ReturnType.Array, Split.validator);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply((args: any[]): string[] => FunctionUtils.parseStringOrNull(args[0]).split(FunctionUtils.parseStringOrNull(args[1] || '')), FunctionUtils.verifyStringOrNull);
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 1, 2, ReturnType.String);
    }
}