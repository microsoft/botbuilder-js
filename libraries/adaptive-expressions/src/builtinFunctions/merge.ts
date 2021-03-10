/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression } from '../expression';
import { EvaluateExpressionDelegate, ExpressionEvaluator, ValueWithError } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { ReturnType } from '../returnType';

/**
 * Merge two JSON objects into one JSON object.
 */
export class Merge extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [Merge](xref:adaptive-expressions.Merge) class.
     */
    public constructor() {
        super(ExpressionType.Merge, Merge.evaluator(), ReturnType.Object, Merge.validator);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applySequenceWithError(
            (args: readonly unknown[]): ValueWithError => {
                let value: unknown;
                let error: string;
                const firstChild = args[0];
                const secondChild = args[1];
                if (
                    typeof firstChild === 'object' &&
                    !Array.isArray(firstChild) &&
                    typeof secondChild === 'object' &&
                    !Array.isArray(secondChild)
                ) {
                    Object.assign(firstChild, secondChild);
                    value = firstChild;
                } else {
                    error = `The argumets ${firstChild} and ${secondChild} must be JSON objects.`;
                }

                return { value, error };
            }
        );
    }

    /**
     * @private
     */
    private static validator(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 2, Number.MAX_SAFE_INTEGER);
    }
}
