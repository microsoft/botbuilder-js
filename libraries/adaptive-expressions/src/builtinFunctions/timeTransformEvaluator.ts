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
import { EvaluateExpressionDelegate, ExpressionEvaluator, ValueWithError } from '../expressionEvaluator';
import { FunctionUtils } from '../functionUtils';
import { InternalFunctionUtils } from '../functionUtils.internal';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';
import { ReturnType } from '../returnType';

/**
 * Evaluator that transforms a datetime to another datetime.
 */
export class TimeTransformEvaluator extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [TimeTransformEvaluator](xref:adaptive-expressions.TimeTransformEvaluator) class.
     *
     * @param type Name of the built-in function.
     * @param func The evaluation function, it takes a timestamp and the number of transformation, and returns a `Date`.
     */
    constructor(type: string, func: (timestamp: Date, numOfTransformation: number) => Date) {
        super(type, TimeTransformEvaluator.evaluator(func), ReturnType.String, TimeTransformEvaluator.validator);
    }

    /**
     * @private
     */
    private static evaluator(func: (timestamp: Date, numOfTransformation: number) => Date): EvaluateExpressionDelegate {
        return (expression: Expression, state: MemoryInterface, options: Options): ValueWithError => {
            let result: any;
            let locale = options.locale ? options.locale : Intl.DateTimeFormat().resolvedOptions().locale;
            let format = FunctionUtils.DefaultDateTimeFormat;
            const { args, error: childrenError } = FunctionUtils.evaluateChildren(expression, state, options);
            let error = childrenError;
            if (!error) {
                ({ format, locale } = FunctionUtils.determineFormatAndLocale(args, 4, format, locale));
                if (typeof args[0] === 'string' && FunctionUtils.isNumber(args[1])) {
                    error = InternalFunctionUtils.verifyISOTimestamp(args[0]);
                    if (!error) {
                        result = dayjs(func(new Date(args[0]), args[1]))
                            .locale(locale)
                            .utc()
                            .format(format);
                    }
                } else {
                    error = `${expression} should contain an ISO format timestamp and a time interval integer.`;
                }
            }

            return { value: result, error };
        };
    }

    /**
     * @private
     */
    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(
            expression,
            [ReturnType.String, ReturnType.String],
            ReturnType.String,
            ReturnType.Number
        );
    }
}
