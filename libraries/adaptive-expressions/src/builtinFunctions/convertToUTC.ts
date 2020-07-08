/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionEvaluator } from '../expressionEvaluator';
import { ReturnType, Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';
import moment from 'moment';
import { TimeZoneConverter } from '../timeZoneConverter';
import { tz } from 'moment-timezone';

export class ConvertToUTC extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.ConvertToUTC, ConvertToUTC.evaluator, ReturnType.String, ConvertToUTC.validator);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
        let value: any;
        let error: string;
        let args: any[];
        ({args, error} = FunctionUtils.evaluateChildren(expression, state, options));
        if (!error) {
            const format: string = (args.length === 3) ? FunctionUtils.timestampFormatter(args[2]) : FunctionUtils.DefaultDateTimeFormat;
            if (typeof (args[0]) === 'string' && typeof (args[1]) === 'string') {
                ({value, error} = ConvertToUTC.evalConvertToUTC(args[0], args[1], format));
            } else {
                error = `${expression} cannot evaluate`;
            }
        }

        return {value, error};
    }

    private static verifyTimeStamp(timeStamp: string): string {
        let parsed: any;
        let error: string;
        parsed = moment(timeStamp);
        if (parsed.toString() === 'Invalid date') {
            error = `${timeStamp} is a invalid datetime`;
        }

        return error;
    }

    private static evalConvertToUTC(timeStamp: string, sourceTimezone: string, format?: string): {value: any; error: string} {
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
                    const sourceTime = tz(timeStamp, timeZone);
                    formattedSourceTime = sourceTime.format();
                } catch (e) {
                    error = `${timeStamp} with ${timeZone} is not a valid timestamp with specified timeZone:`;
                }

                if (!error) {
                    try {
                        result = tz(formattedSourceTime, 'Etc/UTC').format(format);
                    } catch (e) {
                        error = `${format} is not a valid timestamp format`;
                    }
                }
            }
        }

        return {value: result, error};
    }


    private static validator(expr: Expression): void {
        FunctionUtils.validateOrder(expr, [ReturnType.String], ReturnType.String, ReturnType.String);
    }
}