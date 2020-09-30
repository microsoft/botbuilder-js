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
 * Return true if a given TimexProperty or Timex expression refers to a valid date range.
 */
export class IsDateRange extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the `IsDateRange` class.
     */
    public constructor() {
        super(ExpressionType.IsDateRange, IsDateRange.evaluator, ReturnType.Boolean, FunctionUtils.validateUnary);
    }

    /**
     * @private
     */
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
            value = (parsed.year !== undefined && parsed.dayOfMonth === undefined) ||
                (parsed.year !== undefined && parsed.month !== undefined && parsed.dayOfMonth === undefined) ||
                (parsed.month !== undefined && parsed.dayOfMonth === undefined) ||
                parsed.season !== undefined || parsed.weekOfYear !== undefined || parsed.weekOfMonth !== undefined;
        }

        return { value, error };
    }
}
