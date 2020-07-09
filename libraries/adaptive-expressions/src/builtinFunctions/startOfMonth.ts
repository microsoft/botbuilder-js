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

/**
 * Return the start of the month for a timestamp.
 */
export class StartOfMonth extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.StartOfMonth, StartOfMonth.evaluator, ReturnType.String, StartOfMonth.validator);
    }

    private static evaluator(expr: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
        let value: any;
        let error: string;
        let args: any[];
        ({args, error} = FunctionUtils.evaluateChildren(expr, state, options));
        if (!error) {
            const format: string = (args.length === 2) ? FunctionUtils.timestampFormatter(args[1]) : FunctionUtils.DefaultDateTimeFormat;
            if (typeof (args[0]) === 'string') {
                ({value, error} = StartOfMonth.evalStartOfMonth(args[0], format));
            } else {
                error = `${expr} cannot evaluate`;
            }
        }

        return {value, error};
    }

    private static evalStartOfMonth(timeStamp: string, format?: string): {value: any; error: string} {
        let result: string;
        let error: string;
        let parsed: any;
        ({value: parsed, error} = FunctionUtils.parseTimestamp(timeStamp));
        if (!error) {
            const startofMonth = moment(parsed).utc().date(1).hours(0).minutes(0).second(0).millisecond(0);
            ({value: result, error} = FunctionUtils.returnFormattedTimeStampStr(startofMonth, format));
        }

        return {value: result, error};
    }

    private static validator(expr: Expression): void {
        FunctionUtils.validateOrder(expr, [ReturnType.String], ReturnType.String);
    }
}