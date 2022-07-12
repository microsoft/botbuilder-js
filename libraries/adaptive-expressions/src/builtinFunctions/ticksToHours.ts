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
import bigInt from 'big-integer';

/**
 * Convert ticks to number of hours.
 */
export class TicksToHours extends ExpressionEvaluator {
    private static readonly TicksPerHour: number = 60 * 60 * 10000000;

    /**
     * Initializes a new instance of the [TicksToHours](xref:adaptive-expressions.TicksToHours) class.
     */
    constructor() {
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
        let value: any;
        const { args, error: childrenError } = FunctionUtils.evaluateChildren(expr, state, options);
        let error = childrenError;
        if (!error) {
            const firstChild = args[0];
            if (Number.isInteger(firstChild)) {
                value = firstChild / TicksToHours.TicksPerHour;
            } else if (bigInt.isInstance(firstChild)) {
                value = firstChild.toJSNumber() / TicksToHours.TicksPerHour;
            } else {
                error = `${expr} should contain an integer of ticks`;
            }
        }

        return { value, error };
    }
}
