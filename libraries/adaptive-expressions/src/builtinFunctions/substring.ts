/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

<<<<<<< HEAD
import { ExpressionEvaluator } from '../expressionEvaluator';
import { Expression } from '../expression';
import { ReturnType } from '../returnType';
=======
import { Expression } from '../expression';
import { ExpressionEvaluator, ValueWithError } from '../expressionEvaluator';
>>>>>>> master
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';
<<<<<<< HEAD
=======
import { ReturnType } from '../returnType';
>>>>>>> master

/**
 * Return characters from a string, starting from the specified position or index. Index values start with the number 0.
 */
export class Substring extends ExpressionEvaluator {
<<<<<<< HEAD
    public constructor(){
        super(ExpressionType.Substring, Substring.evaluator, ReturnType.String, Substring.validator);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): {value: any; error: string} {
        let result: any;
        let error: any;
        let str: string;
        ({value: str, error} = expression.children[0].tryEvaluate(state, options));
=======
    public constructor() {
        super(ExpressionType.Substring, Substring.evaluator, ReturnType.String, Substring.validator);
    }

    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): ValueWithError {
        let result: any;
        let error: any;
        let str: string;
        ({ value: str, error } = expression.children[0].tryEvaluate(state, options));
>>>>>>> master

        if (!error) {
            if (typeof str === 'string') {
                let start: number;

                const startExpr: Expression = expression.children[1];
<<<<<<< HEAD
                ({value: start, error} = startExpr.tryEvaluate(state, options));
=======
                ({ value: start, error } = startExpr.tryEvaluate(state, options));
>>>>>>> master
                if (!error && !Number.isInteger(start)) {
                    error = `${startExpr} is not an integer.`;
                } else if (start < 0 || start >= str.length) {
                    error = `${startExpr}=${start} which is out of range for ${str}`;
                }
                if (!error) {
                    let length: number;
                    if (expression.children.length === 2) {
                        // Without length, compute to end
                        length = str.length - start;
                    } else {
                        const lengthExpr: Expression = expression.children[2];
<<<<<<< HEAD
                        ({value: length, error} = lengthExpr.tryEvaluate(state, options));
=======
                        ({ value: length, error } = lengthExpr.tryEvaluate(state, options));
>>>>>>> master
                        if (!error && !Number.isInteger(length)) {
                            error = `${lengthExpr} is not an integer`;
                        } else if (length < 0 || Number(start) + Number(length) > str.length) {
                            error = `${lengthExpr}=${length} which is out of range for ${str}`;
                        }
                    }
                    if (!error) {
                        result = str.substr(start, length);
                    }
                }
            } else if (str === undefined) {
                result = '';
            } else {
                error = `${expression.children[0]} is neither a string nor a null object.`;
            }
        }

<<<<<<< HEAD
        return {value: result, error};
=======
        return { value: result, error };
>>>>>>> master
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [ReturnType.Number], ReturnType.String, ReturnType.Number);
    }
}