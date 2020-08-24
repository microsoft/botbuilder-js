/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as jsPath from 'jspath';

import { Expression } from '../expression';
import { EvaluateExpressionDelegate, ExpressionEvaluator, ValueWithError } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { ReturnType } from '../returnType';

/**
 * Check JSON or a JSON string for nodes or values that match a path expression, and return the matching nodes.
 */
export class JPath extends ExpressionEvaluator {
    public constructor() {
        super(ExpressionType.JPath, JPath.evaluator(), ReturnType.Object, JPath.validator);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError((args: any[][]): any => JPath.evalJPath(args[0], args[1].toString()));
    }

    private static evalJPath(jsonEntity: object | string, path: string): ValueWithError {
        let result: any;
        let error: string;
        let evaled: any;
        let json: object;
        if (typeof jsonEntity === 'string') {
            try {
                json = JSON.parse(jsonEntity);
            } catch (e) {
                error = `${ jsonEntity } is not a valid json string`;
            }
        } else if (typeof jsonEntity === 'object') {
            json = jsonEntity;
        } else {
            error = 'the first parameter should be either an object or a string';
        }

        if (!error) {
            try {
                evaled = jsPath.apply(path, json);
            } catch (e) {
                error = `${ path } is not a valid path + ${ e }`;
            }
        }

        result = evaled;

        return { value: result, error };
    }

    private static validator(expr: Expression): void {
        FunctionUtils.validateOrder(expr, undefined, ReturnType.Object, ReturnType.String);
    }
}
