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
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';
import { ReturnType } from '../returnType';

/**
 * Convert ticks to number of hours.
 */
export class TicksToHours extends ExpressionEvaluator {
    private static readonly TicksPerHour: number = 60 * 60 * 10000000;

    /**
     * Initializes a new instance of the [TicksToHours](xref:adaptive-expressions.TicksToHours) class.
     */
    public constructor() {
        super(
            ExpressionType.TicksToHours,
            TicksToHours.evaluator,
            ReturnType.Number,
            FunctionUtils.validateUnaryNumber
        );
    }

    /**
     * @private
     */
    private static evaluator(expr: Expression, state: MemoryInterface, options: Options): ValueWithError {
        let value: unknown;
        const { args, error: childrenError } = FunctionUtils.evaluateChildren(expr, state, options);
        let error = childrenError;
        if (!error) {
            if (FunctionUtils.isInteger(args[0])) {
                value = (args[0] as number) / TicksToHours.TicksPerHour;
            } else {
                error = `${expr} should contain an integer of ticks`;
            }
        }

        return { value, error };
    }
}
