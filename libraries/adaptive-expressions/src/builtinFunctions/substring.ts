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
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';
import { ReturnType } from '../returnType';

/**
 * Return characters from a string, starting from the specified position or index. Index values start with the number 0.
 */
export class Substring extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [Substring](xref:adaptive-expressions.Substring) class.
     */
    public constructor() {
        super(ExpressionType.Substring, Substring.evaluator, ReturnType.String, Substring.validator);
    }

    /**
     * @private
     */
    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): ValueWithError {
        let result: unknown;
        const { value: str, error: childrenError } = expression.children[0].tryEvaluate(state, options);
        let error = childrenError;

        if (!error) {
            if (typeof str === 'string') {
                const startExpr: Expression = expression.children[1];
                const startEvaluateResult = startExpr.tryEvaluate(state, options);
                const start = startEvaluateResult.value;
                error = startEvaluateResult.error;

                if (!error && !FunctionUtils.isInteger(start)) {
                    error = `${startExpr} is not an integer.`;
                } else if (start < 0 || start >= str.length) {
                    error = `${startExpr}=${start} which is out of range for ${str}`;
                }
                if (!error) {
                    let length: unknown;
                    if (expression.children.length === 2) {
                        // Without length, compute to end
                        length = str.length - (start as number);
                    } else {
                        const lengthExpr: Expression = expression.children[2];
                        const lengthEvaluateResult = lengthExpr.tryEvaluate(state, options);
                        length = lengthEvaluateResult.value;
                        error = lengthEvaluateResult.error;

                        if (!error && !FunctionUtils.isInteger(length)) {
                            error = `${lengthExpr} is not an integer`;
                        } else if (length < 0 || (start as number) + (length as number) > str.length) {
                            error = `${lengthExpr}=${length} which is out of range for ${str}`;
                        }
                    }
                    if (!error) {
                        result = str.substr(start as number, length as number);
                    }
                }
            } else if (str === undefined) {
                result = '';
            } else {
                error = `${expression.children[0]} is neither a string nor a null object.`;
            }
        }

        return { value: result, error };
    }

    /**
     * @private
     */
    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [ReturnType.Number], ReturnType.String, ReturnType.Number);
    }
}
