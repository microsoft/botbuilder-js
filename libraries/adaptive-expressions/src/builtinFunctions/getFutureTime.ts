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
import { InternalFunctionUtils } from '../functionUtils.internal';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';
import { ReturnType } from '../returnType';

/**
 * Return the current timestamp plus the specified time units.
 */
export class GetFutureTime extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the `GetFutureTime` class.
     */
    public constructor() {
        super(ExpressionType.GetFutureTime, GetFutureTime.evaluator, ReturnType.String, GetFutureTime.validator);
    }

    /**
     * @private
     */
    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): ValueWithError {
        let value: any;
        let error: any;
        let args: any[];
        ({ args, error } = FunctionUtils.evaluateChildren(expression, state, options));
        if (!error) {
            if (Number.isInteger(args[0]) && typeof args[1] === 'string') {
                const format: string =
                    args.length === 3 ? FunctionUtils.timestampFormatter(args[2]) : FunctionUtils.DefaultDateTimeFormat;
                const { duration, tsStr } = InternalFunctionUtils.timeUnitTransformer(args[0], args[1]);
                if (tsStr === undefined) {
                    error = `${ args[2] } is not a valid time unit.`;
                } else {
                    const dur: any = duration;
                    ({ value, error } = InternalFunctionUtils.parseTimestamp(
                        new Date().toISOString(),
                        (dt: Date): string => {
                            return moment(dt).utc().add(dur, tsStr).format(format);
                        }
                    ));
                }
            } else {
                error = `${ expression } should contain a time interval integer, a string unit of time and an optional output format string.`;
            }
        }

        return { value, error };
    }

    /**
     * @private
     */
    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [ReturnType.String], ReturnType.Number, ReturnType.String);
    }
}
