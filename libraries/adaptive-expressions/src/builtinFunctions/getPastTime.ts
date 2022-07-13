/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
import { Expression } from '../expression';
import { ExpressionEvaluator, ValueWithError } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { InternalFunctionUtils } from '../functionUtils.internal';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';
import { ReturnType } from '../returnType';

/**
 * Return the current timestamp minus the specified time units.
 */
export class GetPastTime extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [GetPastTime](xref:adaptive-expressions.GetPastTime) class.
     */
    constructor() {
        super(ExpressionType.GetPastTime, GetPastTime.evaluator, ReturnType.String, GetPastTime.validator);
    }

    /**
     * @private
     */
    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): ValueWithError {
        let value: any;
        let locale = options.locale ? options.locale : Intl.DateTimeFormat().resolvedOptions().locale;
        let format = FunctionUtils.DefaultDateTimeFormat;
        const { args, error: childrenError } = FunctionUtils.evaluateChildren(expression, state, options);
        let error = childrenError;
        if (!error) {
            if (Number.isInteger(args[0]) && typeof args[1] === 'string') {
                ({ format, locale } = FunctionUtils.determineFormatAndLocale(args, 4, format, locale));
                const { duration, tsStr } = InternalFunctionUtils.timeUnitTransformer(args[0], args[1]);
                if (tsStr === undefined) {
                    error = `${args[2]} is not a valid time unit.`;
                } else {
                    value = dayjs().locale(locale).utc().subtract(duration, tsStr).format(format);
                }
            } else {
                error = `${expression} should contain a time interval integer, a string unit of time and an optional output format string.`;
            }
        }

        return { value, error };
    }

    /**
     * @private
     */
    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(
            expression,
            [ReturnType.String, ReturnType.String],
            ReturnType.Number,
            ReturnType.String
        );
    }
}
