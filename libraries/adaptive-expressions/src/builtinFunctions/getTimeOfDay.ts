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
 * Returns time of day for a given timestamp.
 */
export class GetTimeOfDay extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [GetTimeOfDay](xref:adaptive-expressions.GetTimeOfDay) class.
     */
    public constructor() {
        super(
            ExpressionType.GetTimeOfDay,
            GetTimeOfDay.evaluator(),
            ReturnType.String,
            FunctionUtils.validateUnaryString
        );
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError((args: readonly unknown[]): ValueWithError => {
            let value: unknown;
            const error: string = InternalFunctionUtils.verifyISOTimestamp(args[0]);
            if (!error) {
                const args0 = args[0] as string;
                const thisTime: number = new Date(args0).getUTCHours() * 100 + new Date(args0).getUTCMinutes();
                if (thisTime === 0) {
                    value = 'midnight';
                } else if (thisTime > 0 && thisTime < 1200) {
                    value = 'morning';
                } else if (thisTime === 1200) {
                    value = 'noon';
                } else if (thisTime > 1200 && thisTime < 1800) {
                    value = 'afternoon';
                } else if (thisTime >= 1800 && thisTime <= 2200) {
                    value = 'evening';
                } else if (thisTime > 2200 && thisTime <= 2359) {
                    value = 'night';
                }
            }

            return { value, error };
        }, FunctionUtils.verifyString);
    }
}
