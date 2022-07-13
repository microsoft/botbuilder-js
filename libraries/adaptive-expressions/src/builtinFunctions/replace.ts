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
import { InternalFunctionUtils } from '../functionUtils.internal';
import { ReturnType } from '../returnType';

/**
 * Replace a substring with the specified string, and return the result string.
 * This function is case-sensitive.
 */
export class Replace extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [Replace](xref:adaptive-expressions.Replace) class.
     */
    constructor() {
        super(ExpressionType.Replace, Replace.evaluator(), ReturnType.String, Replace.validator);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError((args: any[]): any => {
            let error = undefined;
            let result = undefined;
            if (InternalFunctionUtils.parseStringOrUndefined(args[1]).length === 0) {
                error = `${args[1]} should be a string with length at least 1`;
            }

            if (!error) {
                result = InternalFunctionUtils.parseStringOrUndefined(args[0])
                    .split(InternalFunctionUtils.parseStringOrUndefined(args[1]))
                    .join(InternalFunctionUtils.parseStringOrUndefined(args[2]));
            }

            return { value: result, error };
        }, FunctionUtils.verifyStringOrNull);
    }

    /**
     * @private
     */
    private static validator(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 3, 3, ReturnType.String);
    }
}
