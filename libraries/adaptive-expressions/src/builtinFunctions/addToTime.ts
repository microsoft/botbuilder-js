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
import { Expression } from '../expression';
import { ExpressionEvaluator, ValueWithError } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { InternalFunctionUtils } from '../functionUtils.internal';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';
import { ReturnType } from '../returnType';

/**
 * Add a number of time units to a timestamp.
 */
export class AddToTime extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [AddToTime](xref:adaptive-expressions.AddToTime) class.
     */
    constructor() {
        super(ExpressionType.AddToTime, AddToTime.evaluator, ReturnType.String, AddToTime.validator);
    }

    /**
     * @private
     */
    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): ValueWithError {
        let value: any;

        let locale = options.locale ? options.locale : Intl.DateTimeFormat().resolvedOptions().locale;
        let format = FunctionUtils.DefaultDateTimeFormat;
        const { args, error: childrenError } = FunctionUtils.evaluateChildren(expression, state, options);
        let error = childrenError;

        if (!error) {
            ({ format, locale } = FunctionUtils.determineFormatAndLocale(args, 5, format, locale));
            if (typeof args[0] === 'string' && Number.isInteger(args[1]) && typeof args[2] === 'string') {
                ({ value, error } = AddToTime.evalAddToTime(args[0], args[1], args[2], format, locale));
            } else {
                error = `${expression} should contain an ISO format timestamp, a time interval integer, a string unit of time and an optional output format string.`;
            }
        }

        return { value, error };
    }

    /**
     * @private
     */
    private static evalAddToTime(
        timeStamp: string,
        interval: number,
        timeUnit: string,
        format?: string,
        locale?: string
    ): ValueWithError {
        let result: string;
        const error = InternalFunctionUtils.verifyISOTimestamp(timeStamp);
        if (!error) {
            const { duration, tsStr } = InternalFunctionUtils.timeUnitTransformer(interval, timeUnit);
            result = dayjs(timeStamp).locale(locale).utc().add(duration, tsStr).format(format);
        }

        return { value: result, error };
    }

    /**
     * @private
     */
    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(
            expression,
            [ReturnType.String, ReturnType.String],
            ReturnType.String,
            ReturnType.Number,
            ReturnType.String
        );
    }
}
