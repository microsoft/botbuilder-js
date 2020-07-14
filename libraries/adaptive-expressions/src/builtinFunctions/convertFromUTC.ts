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

/**
 * Convert a timestamp from Universal Time Coordinated (UTC) to a target time zone.
 */
export class ConvertFromUTC extends ExpressionEvaluator {

    private static readonly NoneUtcDefaultDateTimeFormat: string = 'YYYY-MM-DDTHH:mm:ss.SSSZ';

    public constructor(){
        super(ExpressionType.ConvertFromUTC, ConvertFromUTC.evaluator, ReturnType.String, ConvertFromUTC.validator);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
        let value: any;
        let error: string;
        let args: any[];
        let format = FunctionUtils.DefaultDateTimeFormat;
        let locale = options.locale;
        ({args, error} = FunctionUtils.evaluateChildren(expression, state, options));

        if (!error) {
            ({format, locale} = FunctionUtils.determineFormatAndLocale(args, format, locale, 3));
        }

        if (!error) {
            if (typeof (args[0]) === 'string' && typeof (args[1]) === 'string') {
                ({value, error} = ConvertFromUTC.evalConvertFromUTC(args[0], args[1], format, locale));
            } else {
                error = `${expression} cannot evaluate`;
            }
        }

        return {value, error};
    }

    private static evalConvertFromUTC(timeStamp: string, destinationTimeZone: string, format?: string, locale?: string): {value: any; error: string} {
        let result: string;
        let error: string;
        error = FunctionUtils.verifyISOTimestamp(timeStamp);
        const timeZone: string = TimeZoneConverter.windowsToIana(destinationTimeZone);
        if (!TimeZoneConverter.verifyTimeZoneStr(timeZone)) {
            error = `${destinationTimeZone} is not a valid timezone`;
        }

        if (!error) {
            if (format === '') {
                result = tz(timeStamp, timeZone).locale(locale).toString();
            } else {
                try {
                    result = tz(timeStamp, timeZone).format(format);
                } catch (e) {
                    error = `${format} is not a valid timestamp format`;
                }
            }
        }

        return {value: result, error};
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [ReturnType.String, ReturnType.String], ReturnType.String, ReturnType.String);
    }
}