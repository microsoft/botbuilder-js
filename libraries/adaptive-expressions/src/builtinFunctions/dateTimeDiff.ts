/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression } from '../expression';
import { ExpressionEvaluator, ValueWithError } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import dayjs from 'dayjs';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';
import { ReturnType } from '../returnType';
import { InternalFunctionUtils } from '../functionUtils.internal';

/**
 * Return a number of ticks that the two timestamps differ.
 */
export class DateTimeDiff extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [DateTimeDiff](xref:adaptive-expressions.DateTimeDiff) class.
     */
    constructor() {
        super(ExpressionType.DateTimeDiff, DateTimeDiff.evaluator, ReturnType.Number, DateTimeDiff.validator);
    }

    /**
     * @private
     */
    private static evaluator(expr: Expression, state: MemoryInterface, options: Options): ValueWithError {
        let value: any;
        const { args, error: childrenError } = FunctionUtils.evaluateChildren(expr, state, options);
        let error = childrenError;

        if (!error) {
            error = InternalFunctionUtils.verifyISOTimestamp(args[0]);
            if (!error) {
                error = InternalFunctionUtils.verifyISOTimestamp(args[1]);
                if (!error) {
                    value = dayjs(args[0]).diff(dayjs(args[1]), 'milliseconds') * 10000;
                }
            }
        }

        return { value, error };
    }

    /**
     * @private
     */
    private static validator(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 2, 2, ReturnType.String);
    }
}
