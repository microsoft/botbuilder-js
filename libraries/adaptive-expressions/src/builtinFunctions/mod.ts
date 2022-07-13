/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { EvaluateExpressionDelegate, ExpressionEvaluator } from '../expressionEvaluator';
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
    constructor() {
        super(ExpressionType.Mod, Mod.evaluator(), ReturnType.Number, FunctionUtils.validateBinaryNumber);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError((args: any[]): any => {
            let error: string;
            let value: any;
            if (Number(args[1]) === 0) {
                error = 'Cannot mod by 0.';
            } else {
                value = args[0] % args[1];
            }

            return { value, error };
        }, FunctionUtils.verifyInteger);
    }
}
