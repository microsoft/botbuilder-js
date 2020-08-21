/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { EvaluateExpressionDelegate, ExpressionEvaluator, ValueWithError } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { ReturnType } from '../returnType';
import { Expression } from '../expression';
import { Options } from '../options';
import { stringify } from 'querystring';
import { Extensions } from '../extensions';
import { MemoryInterface } from '../memory';

/**
 * Return a random integer from a specified range, which is inclusive only at the starting end.
 */
export class Rand extends ExpressionEvaluator {
    public constructor() {
        super(ExpressionType.Rand, Rand.evaluator, ReturnType.Number, FunctionUtils.validateBinaryNumber);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): ValueWithError {
        let result;
        let minValue;
        let maxValue;
        let error: string;

        ({value:minValue, error} = expression.children[0].tryEvaluate(state, options));
        if (error) {
            return {value:result, error};
        }
        if(!Number.isInteger(minValue)) {
            return { value:result, error:`${minValue} is not an integer.`};
        }

        ({value:maxValue, error} = expression.children[1].tryEvaluate(state, options));
        if (error) {
            return {value:result, error};
        }
        if(!Number.isInteger(maxValue)) {
            return { value:result, error:`${maxValue} is not an integer.`};
        }

        if (minValue > maxValue) {
            error = `Min value ${minValue} cannot be greater than max value ${maxValue}.`;
        } else {
            result = Extensions.randomNext(state, minValue, maxValue);
        }

        return {value:result, error};
    }
}