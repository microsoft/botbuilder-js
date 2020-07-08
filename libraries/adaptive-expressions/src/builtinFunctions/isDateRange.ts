/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionEvaluator } from '../expressionEvaluator';
import { ReturnType, Expression } from '../expression';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';
import {TimexProperty} from '@microsoft/recognizers-text-data-types-timex-expression';

export class IsDateRange extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.IsDateRange, IsDateRange.evaluator, ReturnType.Boolean, FunctionUtils.validateUnary);
    }

    private static evaluator(expr: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
        let parsed: TimexProperty;
        let value = false;
        let error: string;
        let args: any[];
        ({args, error} = FunctionUtils.evaluateChildren(expr, state, options));
        if (!error) {
            ({timexProperty: parsed, error: error} = FunctionUtils.parseTimexProperty(args[0]));
        }

        if (parsed && !error) {
            value = (parsed.year !== undefined && parsed.dayOfMonth === undefined) ||
                (parsed.year !== undefined && parsed.month !== undefined && parsed.dayOfMonth === undefined) ||
                (parsed.month !== undefined && parsed.dayOfMonth === undefined) ||
                parsed.season !== undefined || parsed.weekOfYear !== undefined || parsed.weekOfMonth !== undefined;
        }

        return {value, error};
    }
}