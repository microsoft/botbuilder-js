/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionEvaluator } from '../expressionEvaluator';
import { Expression } from '../expression';
import { ReturnType } from '../returnType';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { InternalFunctionUtils } from '../functionUtils.internal';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';
import { TimeZoneConverter } from '../timeZoneConverter';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(timezone);
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
import { TimexProperty } from '@microsoft/recognizers-text-data-types-timex-expression';

/**
 * Return the previous viable date of a timex expression based on the current date and user's timezone.
 */
export class GetPreviousViableDate extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [GetPreviousViableDate](xref:adaptive-expressions.GetPreviousViableDate) class.
     */
    constructor() {
        super(
            ExpressionType.GetPreviousViableDate,
            GetPreviousViableDate.evaluator,
            ReturnType.String,
            FunctionUtils.validateUnaryOrBinaryString
        );
    }

    /**
     * @private
     */
    private static evaluator(
        expr: Expression,
        state: MemoryInterface,
        options: Options
    ): { value: any; error: string } {
        let parsed: TimexProperty;
        const currentTime = dayjs(new Date().toISOString());
        let validYear = 0;
        let validMonth = 0;
        let validDay = 0;
        let convertedDateTime: dayjs.Dayjs;
        const { args, error: childrenError } = FunctionUtils.evaluateChildren(expr, state, options);
        let error = childrenError;
        if (!error) {
            ({ timexProperty: parsed, error: error } = InternalFunctionUtils.parseTimexProperty(args[0]));
        }

        if (parsed && !error) {
            if (parsed.year || !parsed.month || !parsed.dayOfMonth) {
                error = `${args[0]} must be a timex string which only contains month and day-of-month, for example: 'XXXX-10-31'.`;
            }
        }

        if (!error) {
            if (args.length === 2 && typeof args[1] === 'string') {
                const timeZone: string = TimeZoneConverter.windowsToIana(args[1]);
                if (!TimeZoneConverter.verifyTimeZoneStr(timeZone)) {
                    error = `${args[1]} is not a valid timezone`;
                }

                if (!error) {
                    convertedDateTime = currentTime.utc().tz(timeZone);
                }
            } else {
                convertedDateTime = currentTime.utc();
            }
        }

        if (!error) {
            const year = convertedDateTime.year();
            const month = convertedDateTime.month() + 1;
            const dayOfMonth = convertedDateTime.date();

            if (parsed.month < month || (parsed.month === month && parsed.dayOfMonth < dayOfMonth)) {
                validYear = year;
            } else {
                validYear = year - 1;
            }

            validMonth = parsed.month;
            validDay = parsed.dayOfMonth;

            if (validMonth === 2 && validDay === 29) {
                while (!GetPreviousViableDate.leapYear(validYear)) {
                    validYear -= 1;
                }
            }
        }

        const value = TimexProperty.fromDate(new Date(validYear, validMonth - 1, validDay)).timex;
        return { value, error };
    }

    /**
     * @private
     */
    private static leapYear(year: number): boolean {
        return (year % 4 === 0 && year % 100 != 0) || year % 400 === 0;
    }
}
