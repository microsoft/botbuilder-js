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
 * Return an array that contains substrings, separated by commas, based on the specified delimiter character in the original string.
 */
export class Split extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [Split](xref:adaptive-expressions.Split) class.
     */
    public constructor() {
        super(ExpressionType.Split, Split.evaluator(), ReturnType.Array, Split.validator);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply(
            (args: readonly unknown[]): string[] =>
                InternalFunctionUtils.parseStringOrUndefined(args[0] as string).split(
                    InternalFunctionUtils.parseStringOrUndefined((args[1] as string) || '')
                ),
            FunctionUtils.verifyStringOrNull
        );
    }

    /**
     * @private
     */
    private static validator(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 1, 2, ReturnType.String);
    }
}
