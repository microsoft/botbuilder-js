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
 * Replace a substring with the specified string, and return the result string.
 * This function is case-insensitive.
 */
export class ReplaceIgnoreCase extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.ReplaceIgnoreCase, ReplaceIgnoreCase.evaluator(), ReturnType.String, ReplaceIgnoreCase.validator);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError((
            args: any[]): any => {
            let error = undefined;
            let result = undefined;
            if (FunctionUtils.parseStringOrNull(args[1]).length === 0) {
                error = `${args[1]} should be a string with length at least 1`;
            }

            if (!error) {
                result = FunctionUtils.parseStringOrNull(args[0]).replace(new RegExp(FunctionUtils.parseStringOrNull(args[1]), 'gi'), FunctionUtils.parseStringOrNull(args[2]));
            }

            return {value: result, error};
        }, FunctionUtils.verifyStringOrNull);
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 3, 3, ReturnType.String);
    }
}