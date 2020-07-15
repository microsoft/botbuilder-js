/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression } from '../expression';
import { ExpressionEvaluator } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';
import { ReturnType } from '../returnType';

/**
 * Return the path value of a unified resource identifier (URI).
 */
export class UriPath extends ExpressionEvaluator {
    public constructor() {
        super(ExpressionType.UriPath, UriPath.evaluator, ReturnType.String, FunctionUtils.validateUnary);
    }

    private static evaluator(expr: Expression, state: MemoryInterface, options: Options): { value: any; error: string } {
        let value: any;
        let error: string;
        let args: any[];
        ({ args, error } = FunctionUtils.evaluateChildren(expr, state, options));
        if (!error) {
            if (typeof (args[0]) === 'string') {
                ({ value, error } = UriPath.evalUriPath(args[0]));
            } else {
                error = `${expr} cannot evaluate`;
            }
        }

        return { value, error };
    }

    private static evalUriPath(uri: string): { value: any; error: string } {
        let result: string;
        let error: string;
        let parsed: URL;
        ({ value: parsed, error } = FunctionUtils.parseUri(uri));
        if (!error) {
            try {
                const uriObj: URL = new URL(uri);
                result = uriObj.pathname;
            } catch (e) {
                error = 'invalid operation, input uri should be an absolute URI';
            }
        }

        return { value: result, error };
    }
}