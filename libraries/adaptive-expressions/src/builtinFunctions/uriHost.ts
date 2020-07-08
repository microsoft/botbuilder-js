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

/**
 * Return the host value of a unified resource identifier (URI).
 */
export class UriHost extends ExpressionEvaluator {
    public constructor(){
        super(ExpressionType.UriHost, UriHost.evaluator, ReturnType.String, FunctionUtils.validateUnary);
    }

    private static evaluator(expr: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
        let value: any;
        let error: string;
        let args: any[];
        ({args, error} = FunctionUtils.evaluateChildren(expr, state, options));
        if (!error) {
            if (typeof (args[0]) === 'string') {
                ({value, error} = UriHost.evalUriHost(args[0]));
            } else {
                error = `${expr} cannot evaluate`;
            }
        }

        return {value, error};
    }

    public static evalUriHost(uri: string): {value: any; error: string} {
        let result: string;
        let error: string;
        let parsed: URL;
        ({value: parsed, error} = FunctionUtils.parseUri(uri));
        if (!error) {
            try {
                result = parsed.hostname;
            } catch (e) {
                error = 'invalid operation, input uri should be an absolute URI';
            }
        }

        return {value: result, error};
    }
}