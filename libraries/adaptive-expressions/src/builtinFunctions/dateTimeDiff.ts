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
import { InternalFunctionUtils } from '../functionUtils.internal';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';
import { ReturnType } from '../returnType';

/**
 * Return a number of ticks that the two timestamps differ.
 */
export class DateTimeDiff extends ExpressionEvaluator {
    public constructor() {
        super(ExpressionType.DateTimeDiff, DateTimeDiff.evaluator, ReturnType.Number, DateTimeDiff.validator);
    }

    private static evaluator(expr: Expression, state: MemoryInterface, options: Options): ValueWithError {
        let value: any;
        let dateTimeStart: any;
        let dateTimeEnd: any;
        let error: string;
        let args: any[];
        ({ args, error } = FunctionUtils.evaluateChildren(expr, state, options));
        if (!error) {
            ({ value: dateTimeStart, error: error } = InternalFunctionUtils.ticks(args[0]));
            if (!error) {
                ({ value: dateTimeEnd, error: error } = InternalFunctionUtils.ticks(args[1]));
            }
        }

        if (!error) {
            value = dateTimeStart - dateTimeEnd;
        }

        return { value, error };
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 2, 2, ReturnType.String);
    }
}
