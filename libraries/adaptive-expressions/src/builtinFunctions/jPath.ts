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
    /**
     * Initializes a new instance of the [JPath](xref:adaptive-expressions.JPath) class.
     */
    constructor() {
        super(ExpressionType.JPath, JPath.evaluator(), ReturnType.Object, JPath.validator);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError((args: any[][]): any => JPath.evalJPath(args[0], args[1].toString()));
    }

    /**
     * @private
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    private static evalJPath(jsonEntity: object | string, path: string): ValueWithError {
        let error: string;
        let evaled: any;
        // eslint-disable-next-line @typescript-eslint/ban-types
        let json: object;
        if (typeof jsonEntity === 'string') {
            try {
                json = JSON.parse(jsonEntity);
            } catch {
                error = `${jsonEntity} is not a valid json string`;
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
                error = `${path} is not a valid path + ${e}`;
            }
        }

        return { value: evaled, error };
    }

    /**
     * @private
     */
    private static validator(expr: Expression): void {
        FunctionUtils.validateOrder(expr, undefined, ReturnType.Object, ReturnType.String);
    }
}
