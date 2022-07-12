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
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';
import { ReturnType } from '../returnType';
import { TimeZoneConverter } from '../timeZoneConverter';

/**
 * Convert a timestamp to Universal Time Coordinated (UTC) from the source time zone.
 */
export class ConvertToUTC extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [ConvertToUTC](xref:adaptive-expressions.ConvertToUTC) class.
     */
    constructor() {
        super(ExpressionType.ConvertToUTC, ConvertToUTC.evaluator, ReturnType.String, ConvertToUTC.validator);
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
            ({ format, locale } = FunctionUtils.determineFormatAndLocale(args, 4, format, locale));
            if (typeof args[0] === 'string' && typeof args[1] === 'string') {
                ({ value, error } = ConvertToUTC.evalConvertToUTC(args[0], args[1], format, locale));
            } else {
                error = `${expression} should contain an ISO format timestamp, a destination time zone string and an optional output format string.`;
            }
        }

        return { value, error };
    }

    /**
     * @private
     */
    private static verifyTimeStamp(timeStamp: string): string | undefined {
        const parsed = dayjs(timeStamp);
        if (parsed.toString() === 'Invalid Date') {
            return `${timeStamp} is a invalid datetime`;
        }

        return undefined;
    }

    /**
     * @private
     */
    private static evalConvertToUTC(
        timeStamp: string,
        sourceTimezone: string,
        format?: string,
        locale?: string
    ): ValueWithError {
        let result: string;
        let error: string;
        let formattedSourceTime: string;
        const timeZone: string = TimeZoneConverter.windowsToIana(sourceTimezone);
        if (!TimeZoneConverter.verifyTimeZoneStr(timeZone)) {
            error = `${sourceTimezone} is not a valid timezone`;
        }

        if (!error) {
            error = this.verifyTimeStamp(timeStamp);
            if (!error) {
                try {
                    const sourceTime = dayjs.tz(timeStamp, timeZone);
                    formattedSourceTime = sourceTime.format();
                } catch {
                    error = `${timeStamp} with ${timeZone} is not a valid timestamp with specified timeZone:`;
                }

                if (!error) {
                    try {
                        result = dayjs(formattedSourceTime).locale(locale).tz('Etc/UTC').format(format);
                    } catch {
                        error = `${format} is not a valid timestamp format`;
                    }
                }
            }
        }

        return { value: result, error };
    }

    /**
     * @private
     */
    private static validator(expr: Expression): void {
        FunctionUtils.validateOrder(expr, [ReturnType.String, ReturnType.String], ReturnType.String, ReturnType.String);
    }
}
