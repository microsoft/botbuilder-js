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

import { Expression } from '../expression';
import { ExpressionEvaluator, ValueWithError } from '../expressionEvaluator';
>>>>>>> master
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';
<<<<<<< HEAD
import moment from 'moment';
=======
import { ReturnType } from '../returnType';
>>>>>>> master

/**
 * Return the start of the day for a timestamp.
 */
export class StartOfDay extends ExpressionEvaluator {
<<<<<<< HEAD
    public constructor(){
        super(ExpressionType.StartOfDay, StartOfDay.evaluator, ReturnType.String, StartOfDay.validator);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
        let value: any;
        let error: string;
        let args: any[];
        ({args, error} = FunctionUtils.evaluateChildren(expression, state, options));
        if (!error) {
            const format: string = (args.length === 2) ? FunctionUtils.timestampFormatter(args[1]) : FunctionUtils.DefaultDateTimeFormat;
            if (typeof (args[0]) === 'string') {
                ({value, error} = StartOfDay.evalStartOfDay(args[0], format));
=======
    public constructor() {
        super(ExpressionType.StartOfDay, StartOfDay.evaluator, ReturnType.String, StartOfDay.validator);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): ValueWithError {
        let value: any;
        let error: string;
        let args: any[];
        ({ args, error } = FunctionUtils.evaluateChildren(expression, state, options));
        if (!error) {
            const format: string = (args.length === 2) ? FunctionUtils.timestampFormatter(args[1]) : FunctionUtils.DefaultDateTimeFormat;
            if (typeof (args[0]) === 'string') {
                ({ value, error } = StartOfDay.evalStartOfDay(args[0], format));
>>>>>>> master
            } else {
                error = `${expression} cannot evaluate`;
            }
        }

<<<<<<< HEAD
        return {value, error};
    }

    private static evalStartOfDay(timeStamp: string, format?: string): {value: any; error: string} {
        let result: string;
        let error: string;
        let parsed: any;
        ({value: parsed, error} = FunctionUtils.parseTimestamp(timeStamp));
        if (!error) {
            const startOfDay = moment(parsed).utc().hours(0).minutes(0).second(0).millisecond(0);
            ({value: result, error} = FunctionUtils.returnFormattedTimeStampStr(startOfDay, format));
        }

        return {value: result, error};
=======
        return { value, error };
    }

    private static evalStartOfDay(timeStamp: string, format?: string): ValueWithError {
        let result: string;
        let error: string;
        let parsed: any;
        ({ value: parsed, error } = FunctionUtils.parseTimestamp(timeStamp));
        if (!error) {
            const startOfDay = moment(parsed).utc().hours(0).minutes(0).second(0).millisecond(0);
            ({ value: result, error } = FunctionUtils.returnFormattedTimeStampStr(startOfDay, format));
        }

        return { value: result, error };
>>>>>>> master
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [ReturnType.String], ReturnType.String);
    }
}