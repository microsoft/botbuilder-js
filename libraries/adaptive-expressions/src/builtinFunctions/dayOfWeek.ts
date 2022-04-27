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
import { InternalFunctionUtils } from '../functionUtils.internal';
import { ReturnType } from '../returnType';

/**
 * Return the day of the week from a timestamp.
 */
export class DayOfWeek extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [DayOfWeek](xref:adaptive-expressions.DayOfWeek) class.
     */
    constructor() {
        super(ExpressionType.DayOfWeek, DayOfWeek.evaluator(), ReturnType.Number, FunctionUtils.validateUnaryString);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError((args: any[]): any => {
            const error = InternalFunctionUtils.verifyISOTimestamp(args[0]);
            if (!error) {
                return { value: new Date(args[0]).getUTCDay(), error };
            }

            return { value: undefined, error };
        }, FunctionUtils.verifyString);
    }
}
