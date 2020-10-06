/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TimexProperty } from '@microsoft/recognizers-text-data-types-timex-expression';

import { Expression } from '../expression';
import { ExpressionEvaluator, ValueWithError } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { InternalFunctionUtils } from '../functionUtils.internal';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';
import { ReturnType } from '../returnType';

/**
 * Return true if a given `TimexProperty` or timex string refers to a valid date.
 * Valid dates contain the month and dayOfMonth, or contain the dayOfWeek.
 */
export class IsDate extends ExpressionEvaluator {
    public constructor() {
        super(ExpressionType.IsDate, IsDate.evaluator, ReturnType.Boolean, FunctionUtils.validateUnary);
    }

    private static evaluator(expr: Expression, state: MemoryInterface, options: Options): ValueWithError {
        let parsed: TimexProperty;
        let value = false;
        let error: string;
        let args: any[];
        ({ args, error } = FunctionUtils.evaluateChildren(expr, state, options));
        if (!error) {
            ({ timexProperty: parsed, error: error } = InternalFunctionUtils.parseTimexProperty(args[0]));
        }

        if (parsed && !error) {
            value = (parsed.month !== undefined && parsed.dayOfMonth !== undefined) || parsed.dayOfWeek !== undefined;
        }

        return { value, error };
    }
}