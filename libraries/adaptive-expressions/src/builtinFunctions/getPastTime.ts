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
import moment from 'moment';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';

/**
 * Return the current timestamp minus the specified time units.
 */
export class GetPastTime extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.GetPastTime, GetPastTime.evaluator, ReturnType.String, GetPastTime.validator);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
        let value: any;
        let error: any;
        let args: any[];
        ({args, error} = FunctionUtils.evaluateChildren(expression, state, options));
        if (!error) {
            if (Number.isInteger(args[0]) && typeof args[1] === 'string') {
                const format: string = (args.length === 3 ? FunctionUtils.timestampFormatter(args[2]) : FunctionUtils.DefaultDateTimeFormat);
                const {duration, tsStr} = FunctionUtils.timeUnitTransformer(args[0], args[1]);
                if (tsStr === undefined) {
                    error = `${args[2]} is not a valid time unit.`;
                } else {
                    const dur: any = duration;
                    ({value, error} = FunctionUtils.parseTimestamp(new Date().toISOString(), (dt: Date): string => {
                        return moment(dt).utc().subtract(dur, tsStr).format(format)}));
                }
            } else {
                error = `${expression} can't evaluate.`;
            }
        }

        return {value, error};
    }


    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [ReturnType.String], ReturnType.Number, ReturnType.String);
    }
}