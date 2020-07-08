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
 * Check whether a string starts with a specific substring. Return true if the substring is found, or return false if not found.
 * This function is case-insensitive.
 */
export class StartsWith extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.StartsWith, StartsWith.evaluator(), ReturnType.Boolean, StartsWith.validator);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply((args: any[]): boolean => FunctionUtils.parseStringOrNull(args[0]).startsWith(FunctionUtils.parseStringOrNull(args[1])), FunctionUtils.verifyStringOrNull);
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 2, 2, ReturnType.String);
    }
}