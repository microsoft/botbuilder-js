/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(timezone);
import { Expression } from '../expression';
import { ExpressionEvaluator, ValueWithError } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { InternalFunctionUtils } from '../functionUtils.internal';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';
import { ReturnType } from '../returnType';
import { TimeZoneConverter } from '../timeZoneConverter';

/**
 * Convert a timestamp from Universal Time Coordinated (UTC) to a target time zone.
 */
export class ConvertFromUTC extends ExpressionEvaluator {
    static readonly NoneUtcDefaultDateTimeFormat: string = 'YYYY-MM-DDTHH:mm:ss.SSS0000';

    /**
     * Initializes a new instance of the [ConvertFromUTC](xref:adaptive-expressions.ConvertFromUTC) class.
     */
    constructor() {
        super(ExpressionType.ConvertFromUTC, ConvertFromUTC.evaluator, ReturnType.String, ConvertFromUTC.validator);
    }

    /**
     * @private
     */
    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): ValueWithError {
        let value: any;
        let locale = options.locale ? options.locale : Intl.DateTimeFormat().resolvedOptions().locale;
        let format = ConvertFromUTC.NoneUtcDefaultDateTimeFormat;
        const { args, error: childrenError } = FunctionUtils.evaluateChildren(expression, state, options);
        let error = childrenError;
        if (!error) {
            ({ format, locale } = FunctionUtils.determineFormatAndLocale(args, 4, format, locale));
            if (typeof args[0] === 'string' && typeof args[1] === 'string') {
                ({ value, error } = ConvertFromUTC.evalConvertFromUTC(args[0], args[1], format, locale));
            } else {
                error = `${expression} should contain an ISO format timestamp, an origin time zone string and an optional output format string.`;
            }
        }

        return { value, error };
    }

    /**
     * @private
     */
    private static evalConvertFromUTC(
        timeStamp: string,
        destinationTimeZone: string,
        format?: string,
        locale?: string
    ): ValueWithError {
        let result: string;
        let error: string;
        error = InternalFunctionUtils.verifyISOTimestamp(timeStamp);
        const timeZone: string = TimeZoneConverter.windowsToIana(destinationTimeZone);
        if (!TimeZoneConverter.verifyTimeZoneStr(timeZone)) {
            error = `${destinationTimeZone} is not a valid timezone`;
        }

        if (!error) {
            try {
                result = dayjs(timeStamp).locale(locale).tz(timeZone).format(format);
            } catch {
                error = `${format} is not a valid timestamp format`;
            }
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
            ReturnType.String
        );
    }
}
