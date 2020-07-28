/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

<<<<<<< HEAD
import { ExpressionEvaluator } from '../expressionEvaluator';
import { Expression } from '../expression';
import { ReturnType } from '../returnType';
=======
import moment from 'moment';
import { tz } from 'moment-timezone';

import { Expression } from '../expression';
import { ExpressionEvaluator, ValueWithError } from '../expressionEvaluator';
>>>>>>> master
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';
<<<<<<< HEAD
import moment from 'moment';
import { TimeZoneConverter } from '../timeZoneConverter';
import { tz } from 'moment-timezone';
=======
import { ReturnType } from '../returnType';
import { TimeZoneConverter } from '../timeZoneConverter';
>>>>>>> master

/**
 * Convert a timestamp to Universal Time Coordinated (UTC) from the source time zone.
 */
export class ConvertToUTC extends ExpressionEvaluator {
<<<<<<< HEAD
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
=======
    public constructor() {
        super(ExpressionType.ConvertToUTC, ConvertToUTC.evaluator, ReturnType.String, ConvertToUTC.validator);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): ValueWithError {
        let value: any;
        let error: string;
        let args: any[];
        ({ args, error } = FunctionUtils.evaluateChildren(expression, state, options));
        if (!error) {
            const format: string = (args.length === 3) ? FunctionUtils.timestampFormatter(args[2]) : FunctionUtils.DefaultDateTimeFormat;
            if (typeof (args[0]) === 'string' && typeof (args[1]) === 'string') {
                ({ value, error } = ConvertToUTC.evalConvertToUTC(args[0], args[1], format));
>>>>>>> master
            } else {
                error = `${expression} cannot evaluate`;
            }
        }

<<<<<<< HEAD
        return {value, error};
=======
        return { value, error };
>>>>>>> master
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

<<<<<<< HEAD
    private static evalConvertToUTC(timeStamp: string, sourceTimezone: string, format?: string): {value: any; error: string} {
=======
    private static evalConvertToUTC(timeStamp: string, sourceTimezone: string, format?: string): ValueWithError {
>>>>>>> master
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

<<<<<<< HEAD
        return {value: result, error};
=======
        return { value: result, error };
>>>>>>> master
    }


    private static validator(expr: Expression): void {
        FunctionUtils.validateOrder(expr, [ReturnType.String], ReturnType.String, ReturnType.String);
    }
}