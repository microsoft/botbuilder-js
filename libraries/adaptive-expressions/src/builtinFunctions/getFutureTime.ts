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
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import moment from 'moment';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';
=======
import moment from 'moment';

import { Expression } from '../expression';
import { ExpressionEvaluator, ValueWithError } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';
import { ReturnType } from '../returnType';
>>>>>>> master

/**
 * Return the current timestamp plus the specified time units.
 */
export class GetFutureTime extends ExpressionEvaluator {
<<<<<<< HEAD
    public constructor(){
        super(ExpressionType.GetFutureTime, GetFutureTime.evaluator, ReturnType.String, GetFutureTime.validator);
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
=======
    public constructor() {
        super(ExpressionType.GetFutureTime, GetFutureTime.evaluator, ReturnType.String, GetFutureTime.validator);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): ValueWithError {
        let value: any;
        let error: any;
        let args: any[];
        ({ args, error } = FunctionUtils.evaluateChildren(expression, state, options));
        if (!error) {
            if (Number.isInteger(args[0]) && typeof args[1] === 'string') {
                const format: string = (args.length === 3 ? FunctionUtils.timestampFormatter(args[2]) : FunctionUtils.DefaultDateTimeFormat);
                const { duration, tsStr } = FunctionUtils.timeUnitTransformer(args[0], args[1]);
>>>>>>> master
                if (tsStr === undefined) {
                    error = `${args[2]} is not a valid time unit.`;
                } else {
                    const dur: any = duration;
<<<<<<< HEAD
                    ({value, error} = FunctionUtils.parseTimestamp(new Date().toISOString(), (dt: Date): string => {
                        return moment(dt).utc().add(dur, tsStr).format(format)}));
=======
                    ({ value, error } = FunctionUtils.parseTimestamp(new Date().toISOString(), (dt: Date): string => {
                        return moment(dt).utc().add(dur, tsStr).format(format)
                    }));
>>>>>>> master
                }
            } else {
                error = `${expression} can't evaluate.`;
            }
        }

<<<<<<< HEAD
        return {value, error};
=======
        return { value, error };
>>>>>>> master
    }


    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [ReturnType.String], ReturnType.Number, ReturnType.String);
    }
}