/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import bigInt from 'big-integer';
import { EvaluateExpressionDelegate, ExpressionEvaluator, ValueWithError } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { ReturnType } from '../returnType';

/**
 * Return the integer version of a string.
 */
export class Int extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [Int](xref:adaptive-expressions.Int) class.
     */
    public constructor() {
        super(ExpressionType.Int, Int.evaluator(), ReturnType.Number, FunctionUtils.validateUnary);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError((args: readonly unknown[]): ValueWithError => {
            let error: string;
            if (bigInt.isInstance(args[0])) {
                    return { value: (args[0] as bigInt.BigInteger).toJSNumber(), error };
            }
            const value: number = parseInt(String(args[0]), 10);
            if (!FunctionUtils.isNumber(value)) {
                error = `parameter ${args[0]} is not a valid number string.`;
            }

            return { value, error };
        });
    }
}
