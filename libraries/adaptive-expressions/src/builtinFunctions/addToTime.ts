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
 * Add a number of time units to a timestamp.
 */
export class AddToTime extends ExpressionEvaluator {
<<<<<<< HEAD
    public constructor(){
        super(ExpressionType.AddToTime, AddToTime.evaluator, ReturnType.String, AddToTime.validator);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
        let value: any;
        let error: string;
        let args: any[];
        ({args, error} = FunctionUtils.evaluateChildren(expression, state, options));
        if (!error) {
            const format: string = (args.length === 4) ? FunctionUtils.timestampFormatter(args[3]) : FunctionUtils.DefaultDateTimeFormat;
            if (typeof (args[0]) === 'string' && Number.isInteger(args[1]) && typeof (args[2]) === 'string') {
                ({value, error} = AddToTime.evalAddToTime(args[0], args[1], args[2], format));
=======
    public constructor() {
        super(ExpressionType.AddToTime, AddToTime.evaluator, ReturnType.String, AddToTime.validator);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): ValueWithError {
        let value: any;
        let error: string;
        let args: any[];
        ({ args, error } = FunctionUtils.evaluateChildren(expression, state, options));
        if (!error) {
            const format: string = (args.length === 4) ? FunctionUtils.timestampFormatter(args[3]) : FunctionUtils.DefaultDateTimeFormat;
            if (typeof (args[0]) === 'string' && Number.isInteger(args[1]) && typeof (args[2]) === 'string') {
                ({ value, error } = AddToTime.evalAddToTime(args[0], args[1], args[2], format));
>>>>>>> master
            } else {
                error = `${expression} cannot evaluate`;
            }
        }

<<<<<<< HEAD
        return {value, error};
    }

    private static evalAddToTime(timeStamp: string, interval: number, timeUnit: string, format?: string): {value: any; error: string} {
        let result: string;
        let error: string;
        let parsed: any;
        ({value: parsed, error} = FunctionUtils.parseTimestamp(timeStamp));
=======
        return { value, error };
    }

    private static evalAddToTime(timeStamp: string, interval: number, timeUnit: string, format?: string): ValueWithError {
        let result: string;
        let error: string;
        let parsed: any;
        ({ value: parsed, error } = FunctionUtils.parseTimestamp(timeStamp));
>>>>>>> master
        if (!error) {
            let dt: any = moment(parsed).utc();
            let addedTime = dt;
            let timeUnitMark: string;
            switch (timeUnit) {
                case 'Second': {
                    timeUnitMark = 's';
                    break;
                }

                case 'Minute': {
                    timeUnitMark = 'm';
                    break;
                }

                case 'Hour': {
                    timeUnitMark = 'h';
                    break;
                }

                case 'Day': {
                    timeUnitMark = 'd';
                    break;
                }

                case 'Week': {
                    timeUnitMark = 'week';
                    break;
                }

                case 'Month': {
                    timeUnitMark = 'month';
                    break;
                }

                case 'Year': {
                    timeUnitMark = 'year';
                    break;
                }

                default: {
                    error = `${timeUnit} is not valid time unit`;
                    break;
                }
            }

            if (!error) {
                addedTime = dt.add(interval, timeUnitMark);
<<<<<<< HEAD
                ({value: result, error} = FunctionUtils.returnFormattedTimeStampStr(addedTime, format));
            }
        }

        return {value: result, error};
=======
                ({ value: result, error } = FunctionUtils.returnFormattedTimeStampStr(addedTime, format));
            }
        }

        return { value: result, error };
>>>>>>> master
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [ReturnType.String], ReturnType.String, ReturnType.Number, ReturnType.String);
    }
}