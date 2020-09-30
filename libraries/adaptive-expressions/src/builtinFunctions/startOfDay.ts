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
 * Return the start of the day for a timestamp.
 */
export class StartOfDay extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the `StartOfDay` class.
     */
    public constructor() {
        super(ExpressionType.StartOfDay, StartOfDay.evaluator, ReturnType.String, StartOfDay.validator);
    }

    /**
     * @private
     */
    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): ValueWithError {
        let value: any;
        let error: string;
        let args: any[];
        ({ args, error } = FunctionUtils.evaluateChildren(expression, state, options));
        if (!error) {
            const format: string = (args.length === 2) ? FunctionUtils.timestampFormatter(args[1]) : FunctionUtils.DefaultDateTimeFormat;
            if (typeof (args[0]) === 'string') {
                ({ value, error } = StartOfDay.evalStartOfDay(args[0], format));
            } else {
                error = `${expression} should contain an ISO format timestamp and an optional output format string.`;
            }
        }

        return { value, error };
    }

    /**
     * @private
     */
    private static evalStartOfDay(timeStamp: string, format?: string): ValueWithError {
        let result: string;
        let error: string;
        let parsed: any;
        ({ value: parsed, error } = InternalFunctionUtils.parseTimestamp(timeStamp));
        if (!error) {
            const startOfDay = moment(parsed).utc().hours(0).minutes(0).second(0).millisecond(0);
            ({ value: result, error } = InternalFunctionUtils.returnFormattedTimeStampStr(startOfDay, format));
        }

        return { value: result, error };
    }

    /**
     * @private
     */
    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [ReturnType.String], ReturnType.String);
    }
}
