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
import { TimexProperty, Time } from '@microsoft/recognizers-text-data-types-timex-expression';
/**
 * Return the previous viable time of a timex expression based on the current time and user's timezone.
 */
export class GetPreviousViableTime extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [GetPreviousViableTime](xref:adaptive-expressions.GetPreviousViableTime) class.
     */
    constructor() {
        super(
            ExpressionType.GetPreviousViableTime,
            GetPreviousViableTime.evaluator,
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
        let validHour = 0;
        let validMinute = 0;
        let validSecond = 0;
        let convertedDateTime: dayjs.Dayjs;
        const formatRegex = /TXX:[0-5][0-9]:[0-5][0-9]/g;
        const { args, error: childrenError } = FunctionUtils.evaluateChildren(expr, state, options);
        let error = childrenError;
        if (!error) {
            if (!formatRegex.test(args[0] as string)) {
                error = `${args[0]}  must be a timex string which only contains minutes and seconds, for example: 'TXX:15:28'`;
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
            ({ timexProperty: parsed, error: error } = InternalFunctionUtils.parseTimexProperty(
                (args[0] as string).replace('XX', '00')
            ));
        }

        if (!error) {
            const hour = convertedDateTime.hour();
            const minute = convertedDateTime.minute();
            const second = convertedDateTime.second();

            if (parsed.minute < minute || (parsed.minute === minute && parsed.second < second)) {
                validHour = hour;
            } else {
                validHour = hour - 1;
            }

            if (validHour < 0) {
                validHour += 24;
            }

            validMinute = parsed.minute;
            validSecond = parsed.second;
        }

        const value = TimexProperty.fromTime(new Time(validHour, validMinute, validSecond)).timex;
        return { value, error };
    }
}
