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
 * Return the query value of a unified resource identifier (URI).
 */
export class UriQuery extends ExpressionEvaluator {
    public constructor() {
        super(ExpressionType.UriQuery, UriQuery.evaluator, ReturnType.String, FunctionUtils.validateUnary);
    }

    private static evaluator(expr: Expression, state: MemoryInterface, options: Options): ValueWithError {
        let value: any;
        const { args, error: childrenError } = FunctionUtils.evaluateChildren(expr, state, options);
        let error = childrenError;
        if (!error) {
            if (typeof args[0] === 'string') {
                ({ value, error } = UriQuery.evalUriQuery(args[0]));
            } else {
                error = `${expr} should contain a URI string.`;
            }
        }

        return { value, error };
    }

    private static evalUriQuery(uri: string): ValueWithError {
        let result: string;
        const { value: parsed, error: parseError } = InternalFunctionUtils.parseUri(uri);
        let error = parseError;
        if (!error) {
            try {
                result = parsed.search;
            } catch (e) {
                error = 'invalid operation, input uri should be an absolute URI';
            }
        }

        return { value: result, error };
    }
}
