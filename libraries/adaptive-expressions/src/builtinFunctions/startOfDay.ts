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
 * Return the start of the day for a timestamp.
 */
export class StartOfDay extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [StartOfDay](xref:adaptive-expressions.StartOfDay) class.
     */
    constructor() {
        super(ExpressionType.StartOfDay, StartOfDay.evaluator, ReturnType.String, StartOfDay.validator);
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
            ({ format, locale } = FunctionUtils.determineFormatAndLocale(args, 3, format, locale));
            if (typeof args[0] === 'string') {
                ({ value, error } = StartOfDay.evalStartOfDay(args[0], format, locale));
            } else {
                error = `${expression} should contain an ISO format timestamp and an optional output format string.`;
            }
        }

        return { value, error };
    }

    /**
     * @private
     */
    private static evalStartOfDay(timeStamp: string, format?: string, locale?: string): ValueWithError {
        let result: string;
        const error = InternalFunctionUtils.verifyISOTimestamp(timeStamp);
        if (!error) {
            result = dayjs(timeStamp).locale(locale).utc().startOf('day').format(format);
        }

        return { value: result, error };
    }

    /**
     * @private
     */
    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [ReturnType.String, ReturnType.String], ReturnType.String);
    }
}
