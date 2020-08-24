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
 * Replace a substring with the specified string, and return the result string.
 * This function is case-sensitive.
 */
export class Replace extends ExpressionEvaluator {
    public constructor() {
        super(ExpressionType.Replace, Replace.evaluator(), ReturnType.String, Replace.validator);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError((
            args: any[]): any => {
            let error = undefined;
            let result = undefined;
            if (FunctionUtils.parseStringOrUndefined(args[1]).length === 0) {
                error = `${ args[1] } should be a string with length at least 1`;
            }

            if (!error) {
                result = FunctionUtils.parseStringOrUndefined(args[0]).split(FunctionUtils.parseStringOrUndefined(args[1])).join(FunctionUtils.parseStringOrUndefined(args[2]));
            }

            return { value: result, error };
        }, FunctionUtils.verifyStringOrNull);
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 3, 3, ReturnType.String);
    }
}
