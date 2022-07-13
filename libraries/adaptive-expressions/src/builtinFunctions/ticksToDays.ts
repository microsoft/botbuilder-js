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
 * Convert ticks to number of days.
 */
export class TicksToDays extends ExpressionEvaluator {
    private static readonly TicksPerDay: number = 24 * 60 * 60 * 10000000;

    /**
     * Initializes a new instance of the [TicksToDays](xref:adaptive-expressions.TicksToDays) class.
     */
    constructor() {
        super(ExpressionType.TicksToDays, TicksToDays.evaluator, ReturnType.Number, FunctionUtils.validateUnaryNumber);
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
                value = firstChild / TicksToDays.TicksPerDay;
            } else if (bigInt.isInstance(firstChild)) {
                value = firstChild.toJSNumber() / TicksToDays.TicksPerDay;
            } else {
                error = `${expr} should contain an integer of ticks`;
            }
        }

        return { value, error };
    }
}
