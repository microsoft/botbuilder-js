/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import moment from 'moment';

import { Expression } from '../expression';
import { EvaluateExpressionDelegate, ExpressionEvaluator, ValueWithError } from '../expressionEvaluator';
import { FunctionUtils } from '../functionUtils';
import { InternalFunctionUtils } from '../functionUtils.internal';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';
import { ReturnType } from '../returnType';

/**
 * Evaluator that transforms a datetime to another datetime.
 */
export class TimeTransformEvaluator extends ExpressionEvaluator {
    public constructor(type: string, func: (timestamp: Date, numOfTransformation: any) => Date) {
        super(type, TimeTransformEvaluator.evaluator(func), ReturnType.String, TimeTransformEvaluator.validator);
    }

    private static evaluator(func: (timestamp: Date, numOfTransformation: any) => Date): EvaluateExpressionDelegate {
        return (expression: Expression, state: MemoryInterface, options: Options): ValueWithError => {
            let result: any;
            let error: string;
            let value: any;
            let args: any[];
            ({ args, error } = FunctionUtils.evaluateChildren(expression, state, options));
            if (!error) {
                if (typeof args[0] === 'string' && typeof args[1] === 'number') {
                    ({ value, error } = InternalFunctionUtils.parseTimestamp(args[0]));
                    if (!error) {
                        if (args.length === 3 && typeof args[2] === 'string') {
                            result = moment(func(value, args[1])).utc().format(FunctionUtils.timestampFormatter(args[2]));
                        } else {
                            result = func(value, args[1]).toISOString();
                        }
                    }
                } else {
                    error = `${expression} could not be evaluated`;
                }
            }

            return { value: result, error };
        };
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [ReturnType.String], ReturnType.String, ReturnType.Number);
    }
}