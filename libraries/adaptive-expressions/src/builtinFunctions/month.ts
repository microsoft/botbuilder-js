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
import { InternalFunctionUtils } from '../functionUtils.internal';
import { ReturnType } from '../returnType';

/**
 * Return the month of the specified timestamp.
 */
export class Month extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [Month](xref:adaptive-expressions.Month) class.
     */
    public constructor() {
        super(ExpressionType.Month, Month.evaluator(), ReturnType.Number, FunctionUtils.validateUnaryString);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError((args: readonly unknown[]): ValueWithError => {
            const error = InternalFunctionUtils.verifyISOTimestamp(args[0]);
            if (!error) {
                return { value: new Date(args[0] as string).getUTCMonth() + 1, error };
            }

            return { value: undefined, error };
        }, FunctionUtils.verifyString);
    }
}
