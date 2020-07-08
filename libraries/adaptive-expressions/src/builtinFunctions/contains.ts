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

export class Contains extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.Contains, Contains.evaluator, ReturnType.Boolean, FunctionUtils.validateBinary);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
        let found = false;
        let error: any;
        let args: any[];
        ({args, error} = FunctionUtils.evaluateChildren(expression, state, options));

        if (!error) {
            if (typeof args[0] === 'string' && typeof args[1] === 'string' || Array.isArray(args[0])) {
                found = args[0].includes(args[1]);
            } else if (args[0] instanceof Map) {
                found = (args[0] as Map<string, any>).get(args[1]) !== undefined;
            } else if (typeof args[1] === 'string') {
                let value: any;
                ({value, error} = FunctionUtils.accessProperty(args[0], args[1]));
                found = !error && value !== undefined;
            }
        }

        return {value: found, error: undefined};
    }
}