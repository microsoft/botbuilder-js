/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import moment from 'moment';

import { Expression } from '../expression';
import { ExpressionEvaluator, ValueWithError } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';
import { ReturnType } from '../returnType';

/**
 * Subtract a number of time units from a timestamp.
 */
export class SubtractFromTime extends ExpressionEvaluator {
    public constructor() {
        super(ExpressionType.SubtractFromTime, SubtractFromTime.evaluator, ReturnType.String, SubtractFromTime.validator);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): ValueWithError {
        let value: any;
        let error: any;
        let args: any[];
        ({ args, error } = FunctionUtils.evaluateChildren(expression, state, options));
        if (!error) {
            if (typeof args[0] === 'string' && Number.isInteger(args[1]) && typeof args[2] === 'string') {
                const format: string = (args.length === 4 ? FunctionUtils.timestampFormatter(args[3]) : FunctionUtils.DefaultDateTimeFormat);
                const { duration, tsStr } = FunctionUtils.timeUnitTransformer(args[1], args[2]);
                if (tsStr === undefined) {
                    error = `${args[2]} is not a valid time unit.`;
                } else {
                    const dur: any = duration;
                    ({ value, error } = FunctionUtils.parseTimestamp(args[0], (dt: Date): string => {
                        return args.length === 4 ?
                            moment(dt).utc().subtract(dur, tsStr).format(format) : moment(dt).utc().subtract(dur, tsStr).toISOString()
                    }));
                }
            } else {
                error = `${expression} can't evaluate.`;
            }
        }

        return { value, error };
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [ReturnType.String], ReturnType.String, ReturnType.Number, ReturnType.String);
    }
}