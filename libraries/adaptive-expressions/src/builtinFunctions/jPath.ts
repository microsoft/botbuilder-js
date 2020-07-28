/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

<<<<<<< HEAD
import { ExpressionEvaluator, EvaluateExpressionDelegate } from '../expressionEvaluator';
import { Expression } from '../expression';
import { ReturnType } from '../returnType';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import * as jsPath from 'jspath';
=======
import * as jsPath from 'jspath';

import { Expression } from '../expression';
import { EvaluateExpressionDelegate, ExpressionEvaluator, ValueWithError } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { ReturnType } from '../returnType';
>>>>>>> master

/**
 * Check JSON or a JSON string for nodes or values that match a path expression, and return the matching nodes.
 */
export class JPath extends ExpressionEvaluator {
<<<<<<< HEAD
    public constructor(){
=======
    public constructor() {
>>>>>>> master
        super(ExpressionType.JPath, JPath.evaluator(), ReturnType.Object, JPath.validator);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError((args: any[][]): any => JPath.evalJPath(args[0], args[1].toString()));
    }

<<<<<<< HEAD
    private static evalJPath(jsonEntity: object | string, path: string): {value: any; error: string} {
=======
    private static evalJPath(jsonEntity: object | string, path: string): ValueWithError {
>>>>>>> master
        let result: any;
        let error: string;
        let evaled: any;
        let json: object;
        if (typeof jsonEntity === 'string') {
            try {
                json = JSON.parse(jsonEntity);
            } catch (e) {
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

        result = evaled;

<<<<<<< HEAD
        return {value: result, error};
=======
        return { value: result, error };
>>>>>>> master
    }

    private static validator(expr: Expression): void {
        FunctionUtils.validateOrder(expr, undefined, ReturnType.Object, ReturnType.String);
    }
}