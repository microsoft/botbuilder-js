/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

<<<<<<< HEAD
import { ExpressionEvaluator } from '../expressionEvaluator';
import { Expression } from '../expression';
import { ReturnType } from '../returnType';
=======
import { TimexProperty } from '@microsoft/recognizers-text-data-types-timex-expression';

import { Expression } from '../expression';
import { ExpressionEvaluator, ValueWithError } from '../expressionEvaluator';
>>>>>>> master
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';
<<<<<<< HEAD
import {TimexProperty} from '@microsoft/recognizers-text-data-types-timex-expression';
=======
import { ReturnType } from '../returnType';
>>>>>>> master

/**
 * Return true if a given TimexProperty or Timex expression refers to a valid date range.
 */
export class IsDateRange extends ExpressionEvaluator {
<<<<<<< HEAD
    public constructor(){
        super(ExpressionType.IsDateRange, IsDateRange.evaluator, ReturnType.Boolean, FunctionUtils.validateUnary);
    }

    private static evaluator(expr: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
=======
    public constructor() {
        super(ExpressionType.IsDateRange, IsDateRange.evaluator, ReturnType.Boolean, FunctionUtils.validateUnary);
    }

    private static evaluator(expr: Expression, state: MemoryInterface, options: Options): ValueWithError {
>>>>>>> master
        let parsed: TimexProperty;
        let value = false;
        let error: string;
        let args: any[];
<<<<<<< HEAD
        ({args, error} = FunctionUtils.evaluateChildren(expr, state, options));
        if (!error) {
            ({timexProperty: parsed, error: error} = FunctionUtils.parseTimexProperty(args[0]));
=======
        ({ args, error } = FunctionUtils.evaluateChildren(expr, state, options));
        if (!error) {
            ({ timexProperty: parsed, error: error } = FunctionUtils.parseTimexProperty(args[0]));
>>>>>>> master
        }

        if (parsed && !error) {
            value = (parsed.year !== undefined && parsed.dayOfMonth === undefined) ||
                (parsed.year !== undefined && parsed.month !== undefined && parsed.dayOfMonth === undefined) ||
                (parsed.month !== undefined && parsed.dayOfMonth === undefined) ||
                parsed.season !== undefined || parsed.weekOfYear !== undefined || parsed.weekOfMonth !== undefined;
        }

<<<<<<< HEAD
        return {value, error};
=======
        return { value, error };
>>>>>>> master
    }
}