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
 * Return the start of the hour for a timestamp.
 */
export class StartOfHour extends ExpressionEvaluator {
<<<<<<< HEAD
    public constructor(){
        super(ExpressionType.StartOfHour, StartOfHour.evaluator, ReturnType.String, StartOfHour.validator);
    }

    private static evaluator(expr: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
        let value: any;
        let error: string;
        let args: any[];
        ({args, error} = FunctionUtils.evaluateChildren(expr, state, options));
        if (!error) {
            const format: string = (args.length === 2) ? FunctionUtils.timestampFormatter(args[1]) : FunctionUtils.DefaultDateTimeFormat;
            if (typeof (args[0]) === 'string') {
                ({value, error} = StartOfHour.evalStartOfHour(args[0], format));
=======
    public constructor() {
        super(ExpressionType.StartOfHour, StartOfHour.evaluator, ReturnType.String, StartOfHour.validator);
    }

    private static evaluator(expr: Expression, state: MemoryInterface, options: Options): ValueWithError {
        let value: any;
        let error: string;
        let args: any[];
        ({ args, error } = FunctionUtils.evaluateChildren(expr, state, options));
        if (!error) {
            const format: string = (args.length === 2) ? FunctionUtils.timestampFormatter(args[1]) : FunctionUtils.DefaultDateTimeFormat;
            if (typeof (args[0]) === 'string') {
                ({ value, error } = StartOfHour.evalStartOfHour(args[0], format));
>>>>>>> master
            } else {
                error = `${expr} cannot evaluate`;
            }
        }

<<<<<<< HEAD
        return {value, error};
    }

    private static evalStartOfHour(timeStamp: string, format?: string): {value: any; error: string} {
        let result: string;
        let error: string;
        let parsed: any;
        ({value: parsed, error} = FunctionUtils.parseTimestamp(timeStamp));
        if (!error) {
            const startofHour = moment(parsed).utc().minutes(0).second(0).millisecond(0);
            ({value: result, error} = FunctionUtils.returnFormattedTimeStampStr(startofHour, format));
        }

        return {value: result, error};
=======
        return { value, error };
    }

    private static evalStartOfHour(timeStamp: string, format?: string): ValueWithError {
        let result: string;
        let error: string;
        let parsed: any;
        ({ value: parsed, error } = FunctionUtils.parseTimestamp(timeStamp));
        if (!error) {
            const startofHour = moment(parsed).utc().minutes(0).second(0).millisecond(0);
            ({ value: result, error } = FunctionUtils.returnFormattedTimeStampStr(startofHour, format));
        }

        return { value: result, error };
>>>>>>> master
    }

    private static validator(expr: Expression): void {
        FunctionUtils.validateOrder(expr, [ReturnType.String], ReturnType.String);
    }
}