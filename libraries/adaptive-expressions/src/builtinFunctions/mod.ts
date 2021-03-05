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
 * Return the remainder from dividing two numbers.
 */
export class Mod extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [Mod](xref:adaptive-expressions.Mod) class.
     */
    public constructor() {
        super(ExpressionType.Mod, Mod.evaluator(), ReturnType.Number, FunctionUtils.validateBinaryNumber);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError((args: readonly unknown[]): ValueWithError => {
            let error: string;
            let value: number;
            if ((args[1] as number) === 0) {
                error = `Cannot mod by 0.`;
            } else {
                value = (args[0] as number) % (args[1] as number);
            }

            return { value, error };
        }, FunctionUtils.verifyInteger);
    }
}
