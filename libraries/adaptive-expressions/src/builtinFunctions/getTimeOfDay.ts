/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import dayjs from 'dayjs';
import { EvaluateExpressionDelegate, ExpressionEvaluator } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { InternalFunctionUtils } from '../functionUtils.internal';
import { ReturnType } from '../returnType';
import { ConvertFromUTC } from './convertFromUTC';

/**
 * Returns time of day for a given timestamp.
 */
export class GetTimeOfDay extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [GetTimeOfDay](xref:adaptive-expressions.GetTimeOfDay) class.
     */
    constructor() {
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
        return FunctionUtils.applyWithError((args: any[]): any => {
            let value: any;
            let error: string = InternalFunctionUtils.verifyISOTimestamp(args[0]);
            let thisTime: number;
            if (error) {
                error = InternalFunctionUtils.verifyTimestamp(args[0]);
                if (error) {
                    return { value, error };
                } else {
                    if (dayjs(args[0]).format(ConvertFromUTC.NoneUtcDefaultDateTimeFormat) === args[0]) {
                        thisTime = new Date(args[0]).getHours() * 100 + new Date(args[0]).getMinutes();
                        error = undefined;
                    } else {
                        return { value, error };
                    }
                }
            } else {
                // utc iso format
                thisTime = new Date(args[0]).getUTCHours() * 100 + new Date(args[0]).getUTCMinutes();
            }

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

            return { value, error };
        }, FunctionUtils.verifyString);
    }
}
