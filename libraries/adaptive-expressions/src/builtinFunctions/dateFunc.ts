/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
import { EvaluateExpressionDelegate, ExpressionEvaluator } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { InternalFunctionUtils } from '../functionUtils.internal';
import { ReturnType } from '../returnType';

/**
 * Return the date of a specified timestamp in m/dd/yyyy format.
 */
export class DateFunc extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [DateFunc](xref:adaptive-expressions.DateFunc) class.
     */
    constructor() {
        super(ExpressionType.Date, DateFunc.evaluator(), ReturnType.String, FunctionUtils.validateUnaryString);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError((args: any[]): any => {
            const error = InternalFunctionUtils.verifyISOTimestamp(args[0]);
            if (!error) {
                return { value: dayjs(args[0]).utc().format('M/DD/YYYY'), error };
            }

            return { value: undefined, error };
        }, FunctionUtils.verifyString);
    }
}
