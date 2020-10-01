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
 * Return the host value of a unified resource identifier (URI).
 */
export class UriHost extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the `UriHost` class.
     */
    public constructor() {
        super(ExpressionType.UriHost, UriHost.evaluator, ReturnType.String, FunctionUtils.validateUnary);
    }

    /**
     * @private
     */
    private static evaluator(expr: Expression, state: MemoryInterface, options: Options): ValueWithError {
        let value: any;
        let error: string;
        let args: any[];
        ({ args, error } = FunctionUtils.evaluateChildren(expr, state, options));
        if (!error) {
            if (typeof args[0] === 'string') {
                ({ value, error } = UriHost.evalUriHost(args[0]));
            } else {
                error = `${ expr } should contain a URI string.`;
            }
        }

        return { value, error };
    }

    /**
     * @private
     */
    private static evalUriHost(uri: string): ValueWithError {
        let result: string;
        let error: string;
        let parsed: URL;
        ({ value: parsed, error } = InternalFunctionUtils.parseUri(uri));
        if (!error) {
            try {
                result = parsed.hostname;
            } catch (e) {
                error = 'invalid operation, input uri should be an absolute URI';
            }
        }

        return { value: result, error };
    }
}
