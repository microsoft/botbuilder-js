/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TimexProperty, valueResolver } from '@microsoft/recognizers-text-data-types-timex-expression';
import { Expression } from '../expression';
import { ExpressionEvaluator, ValueWithError } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { InternalFunctionUtils } from '../functionUtils.internal';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';
import { ReturnType } from '../returnType';

/**
 *  Return true if a given TimexProperty or Timex expression refers to a valid time.
 */
export class TimexResolve extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [TimexResolve](xref:adaptive-expressions.TimexResolve) class.
     */
    constructor() {
        super(ExpressionType.TimexResolve, TimexResolve.evaluator, ReturnType.String, FunctionUtils.validateUnary);
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

        if (!error && parsed.types.size === 0) {
            error = `The parsed TimexProperty of ${args[0]} in ${expr} has no types. It can't be resolved to a string value.`;
        }

        if (!error) {
            const formatedTimex = parsed.timex;
            try {
                const resolvedValues = valueResolver.resolve([formatedTimex]);
                value = resolvedValues.values[0].value;
            } catch (err) {
                error = `${args[0]} in ${expr} is not a valid argument. ${err.Message}`;
            }
        }

        return { value, error };
    }
}
