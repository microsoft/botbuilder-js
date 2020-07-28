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
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';
import { TimeZoneConverter } from '../timeZoneConverter';
import { tz } from 'moment-timezone';
import moment from 'moment';
import {TimexProperty, Time} from '@microsoft/recognizers-text-data-types-timex-expression';
/**
 * Return true if a given TimexProperty or Timex expression refers to the present.
 */
export class GetNextViableTime extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.GetNextViableTime, GetNextViableTime.evaluator, ReturnType.String, FunctionUtils.validateUnaryOrBinaryString);
    }

    private static evaluator(expr: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
        let parsed: TimexProperty;
        let value: string;
        let error: string;
        let args: any[];
        const currentTime = moment(new Date().toISOString());
        let validHour = 0;
        let validMinute = 0;
        let validSecond = 0;
        let convertedDateTime: moment.Moment;
        const formatRegex = /TXX:[0-5][0-9]:[0-5][0-9]/g;
        ({args, error} = FunctionUtils.evaluateChildren(expr, state, options));
        if(!error)  {
            if (!formatRegex.test(args[0] as string)) {
                error = `${args[0]}  must be a timex string which only contains minutes and seconds, for example: 'TXX:15:28'`
            }
        }

        if (!error) {
            if (args.length === 2 && typeof args[1] === 'string') {
                const timeZone: string = TimeZoneConverter .windowsToIana(args[1]);
                if (!TimeZoneConverter.verifyTimeZoneStr(timeZone)) {
                    error = `${args[1]} is not a valid timezone`;
                }

                if (!error) {
                    convertedDateTime = tz(currentTime.utc(), timeZone);
                }
            } else {
                convertedDateTime = currentTime.utc();
            }
        }

        if (!error) {
            ({timexProperty: parsed, error: error} = FunctionUtils.parseTimexProperty((args[0] as string).replace('XX', '00')));
        }

        if (!error) {
            const hour = convertedDateTime.hour();
            const minute = convertedDateTime.minute();
            const second = convertedDateTime.second();

            if (parsed.minute > minute || (parsed.minute === minute && parsed.second >= second)) {
                validHour = hour;
            } else {
                validHour = hour + 1;
            }

            validMinute = parsed.minute;
            validSecond = parsed.second;
        }

        value = TimexProperty.fromTime(new Time(validHour, validMinute, validSecond)).timex;
        return {value, error};
    }
}