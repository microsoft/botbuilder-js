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
 * Returns the index of the last occurrence of a specified value in an array.
 * The zero-based index position of value if that value is found, or -1 if it is not.
 */
export class LastIndexOf extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [LastIndexOf](xref:adaptive-expressions.LastIndexOf) class.
     */
    constructor() {
        super(ExpressionType.LastIndexOf, LastIndexOf.evaluator, ReturnType.Number, LastIndexOf.validator);
    }

    /**
     * @private
     */
    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): ValueWithError {
        let value = -1;
        const { args, error: childrenError } = FunctionUtils.evaluateChildren(expression, state, options);
        let error = childrenError;
        if (!error) {
            if (args[0] == null || typeof args[0] === 'string') {
                if (args[1] === undefined || typeof args[1] === 'string') {
                    const str = InternalFunctionUtils.parseStringOrUndefined(args[0]);
                    const searchValue = InternalFunctionUtils.parseStringOrUndefined(args[1]);
                    value = str.lastIndexOf(searchValue, str.length - 1);
                } else {
                    error = `Can only look for indexof string in ${expression}`;
                }
            } else if (Array.isArray(args[0])) {
                value = args[0].lastIndexOf(args[1]);
            } else {
                error = `${expression} works only on string or list.`;
            }
        }

        return { value, error };
    }

    /**
     * @private
     */
    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [], ReturnType.String | ReturnType.Array, ReturnType.Object);
    }
}
