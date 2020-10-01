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
 * Return the start of the hour for a timestamp.
 */
export class StartOfHour extends ExpressionEvaluator {
    public constructor() {
        super(ExpressionType.StartOfHour, StartOfHour.evaluator, ReturnType.String, StartOfHour.validator);
    }

    private static evaluator(expr: Expression, state: MemoryInterface, options: Options): ValueWithError {
        let value: any;
        let error: string;
        let args: any[];
        ({ args, error } = FunctionUtils.evaluateChildren(expr, state, options));
        if (!error) {
            const format: string =
                args.length === 2 ? FunctionUtils.timestampFormatter(args[1]) : FunctionUtils.DefaultDateTimeFormat;
            if (typeof args[0] === 'string') {
                ({ value, error } = StartOfHour.evalStartOfHour(args[0], format));
            } else {
                error = `${expr} should contain an ISO format timestamp and an optional output format string.`;
            }
        }

        return { value, error };
    }

    private static evalStartOfHour(timeStamp: string, format?: string): ValueWithError {
        let result: string;
        let error: string;
        let parsed: any;
        ({ value: parsed, error } = InternalFunctionUtils.parseTimestamp(timeStamp));
        if (!error) {
            const startofHour = moment(parsed).utc().minutes(0).second(0).millisecond(0);
            ({ value: result, error } = InternalFunctionUtils.returnFormattedTimeStampStr(startofHour, format));
        }

        return { value: result, error };
    }

    private static validator(expr: Expression): void {
        FunctionUtils.validateOrder(expr, [ReturnType.String], ReturnType.String);
    }
}
