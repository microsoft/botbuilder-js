/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
dayjs.extend(dayOfYear);
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
import { EvaluateExpressionDelegate, ExpressionEvaluator } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { InternalFunctionUtils } from '../functionUtils.internal';
import { ReturnType } from '../returnType';

/**
 * Return the day of the year from a timestamp.
 */
export class DayOfYear extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [DayOfYear](xref:adaptive-expressions.DayOfYear) class.
     */
    constructor() {
        super(ExpressionType.DayOfYear, DayOfYear.evaluator(), ReturnType.Number, FunctionUtils.validateUnaryString);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError((args: any[]): any => {
            const error = InternalFunctionUtils.verifyISOTimestamp(args[0]);
            if (!error) {
                return { value: dayjs(args[0]).utc().dayOfYear(), error };
            }

            return { value: undefined, error };
        }, FunctionUtils.verifyString);
    }
}
