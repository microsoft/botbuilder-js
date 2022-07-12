/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { MemoryInterface, Options } from '../';
import { Expression } from '../expression';
import {
    EvaluateExpressionDelegate,
    ExpressionEvaluator,
    ValidateExpressionDelegate,
    ValueWithError,
} from '../expressionEvaluator';
import { FunctionUtils, VerifyExpression } from '../functionUtils';
import { ReturnType } from '../returnType';

/**
 * Comparison operators.
 * A comparison operator returns false if the comparison is false, or there is an error.  This prevents errors from short-circuiting boolean expressions.
 */
export class ComparisonEvaluator extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [ComparisonEvaluator](xref:adaptive-expressions.ComparisonEvaluator) class.
     *
     * @param type Name of the built-in function.
     * @param func The comparison function, it takes a list of objects and returns a boolean.
     * @param validator [ValidateExpressionDelegate](xref:adaptive-expressions.ValidateExpressionDelegate) for input arguments.
     * @param verify Optional. [VerifyExpression](xref:adaptive-expressions.VerifyExpression) function to verify each child's result.
     */
    constructor(
        type: string,
        func: (arg0: any[]) => boolean,
        validator: ValidateExpressionDelegate,
        verify?: VerifyExpression
    ) {
        super(type, ComparisonEvaluator.evaluator(func, verify), ReturnType.Boolean, validator);
    }

    /**
     * @private
     */
    private static evaluator(func: (args: any[]) => boolean, verify?: VerifyExpression): EvaluateExpressionDelegate {
        return (expression: Expression, state: MemoryInterface, options: Options): ValueWithError => {
            let result = false;

            const newOptions = new Options(options);
            newOptions.nullSubstitution = undefined;
            const { args, error: childrenError } = FunctionUtils.evaluateChildren(
                expression,
                state,
                newOptions,
                verify
            );
            let error = childrenError;
            if (!error) {
                try {
                    result = func(args);
                } catch (e) {
                    // NOTE: This should not happen in normal execution
                    error = e.message;
                }
            } else {
                error = undefined;
            }

            return { value: result, error };
        };
    }
}
