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
 * Return true if a given TimexProperty or Timex expression refers to a valid duration.
 */
export class IsDuration extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [IsDuration](xref:adaptive-expressions.IsDuration) class.
     */
    constructor() {
        super(ExpressionType.IsDuration, IsDuration.evaluator, ReturnType.Boolean, FunctionUtils.validateUnary);
    }

    /**
     * @private
     */
    private static evaluator(expr: Expression, state: MemoryInterface, options: Options): ValueWithError {
        let parsed: TimexProperty;
        let value = false;
        const { args, error: childrenError } = FunctionUtils.evaluateChildren(expr, state, options);
        let error = childrenError;
        if (!error) {
            ({ timexProperty: parsed, error: error } = InternalFunctionUtils.parseTimexProperty(args[0]));
        }

        if (parsed && !error) {
            value =
                parsed.years !== undefined ||
                parsed.months !== undefined ||
                parsed.weeks !== undefined ||
                parsed.days !== undefined ||
                parsed.hours !== undefined ||
                parsed.minutes !== undefined ||
                parsed.seconds !== undefined;
        }

        return { value, error };
    }
}
