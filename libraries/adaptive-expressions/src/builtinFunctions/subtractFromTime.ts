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
 * Subtract a number of time units from a timestamp.
 */
export class SubtractFromTime extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [SubtractFromTime](xref:adaptive-expressions.SubtractFromTime) class.
     */
    constructor() {
        super(
            ExpressionType.SubtractFromTime,
            SubtractFromTime.evaluator,
            ReturnType.String,
            SubtractFromTime.validator
        );
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
            if (typeof args[0] === 'string' && Number.isInteger(args[1]) && typeof args[2] === 'string') {
                ({ format, locale } = FunctionUtils.determineFormatAndLocale(args, 5, format, locale));
                const { duration, tsStr } = InternalFunctionUtils.timeUnitTransformer(args[1], args[2]);
                if (tsStr === undefined) {
                    error = `${args[2]} is not a valid time unit.`;
                } else {
                    const dur: any = duration;
                    error = InternalFunctionUtils.verifyISOTimestamp(args[0]);
                    if (!error) {
                        value = dayjs(args[0]).locale(locale).utc().subtract(dur, tsStr).format(format);
                    }
                }
            } else {
                error = `${expression} should contain an ISO format timestamp, a time interval integer, a string unit of time and an optional output format string.`;
            }
        }

        return { value, error };
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
