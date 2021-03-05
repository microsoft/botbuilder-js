/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { EvaluateExpressionDelegate, ExpressionEvaluator, ValueWithError } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { ReturnType } from '../returnType';

/**
 * Return an integer array that starts from a specified integer with the given length.
 */
export class Range extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [Range](xref:adaptive-expressions.Range) class.
     */
    public constructor() {
        super(ExpressionType.Range, Range.evaluator(), ReturnType.Array, FunctionUtils.validateBinaryNumber);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError((args: readonly unknown[]): ValueWithError => {
            let error: string;
            if (args[1] <= 0) {
                error = 'Second paramter must be more than zero';
            }

            const result: number[] = [...Array(args[1]).keys()].map((u: number): number => u + (args[0] as number));

            return { value: result, error };
        }, FunctionUtils.verifyInteger);
    }
}
