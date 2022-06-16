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
import { SimpleObjectMemory } from '../memory/simpleObjectMemory';
import { Options } from '../options';
import { ReturnType } from '../returnType';

/**
 * Used to access the variable value corresponding to the path.
 */
export class Accessor extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [Accessor](xref:adaptive-expressions.Accessor) class.
     */
    constructor() {
        super(ExpressionType.Accessor, Accessor.evaluator, ReturnType.Object, Accessor.validator);
    }

    /**
     * @private
     */
    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): ValueWithError {
        const { path, left, error } = FunctionUtils.tryAccumulatePath(expression, state, options);
        if (error) {
            return { value: undefined, error };
        }

        if (left == null) {
            // fully converted to path, so we just delegate to memory scope
            return { value: InternalFunctionUtils.wrapGetValue(state, path, options), error: undefined };
        } else {
            const { value: newScope, error: err } = left.tryEvaluate(state, options);
            if (err) {
                return { value: undefined, error: err };
            }

            return {
                value: InternalFunctionUtils.wrapGetValue(new SimpleObjectMemory(newScope), path, options),
                error: undefined,
            };
        }
    }

    /**
     * @private
     */
    private static validator(expression: Expression): void {
        const children = expression.children;
        if (
            children.length === 0 ||
            children[0].type !== ExpressionType.Constant ||
            children[0].returnType !== ReturnType.String
        ) {
            throw new Error(`${expression} must have a string as first argument.`);
        }

        if (children.length > 2) {
            throw new Error(`${expression} has more than 2 children.`);
        }
        if (children.length === 2 && (children[1].returnType & ReturnType.Object) === 0) {
            throw new Error(`${expression} must have an object as its second argument.`);
        }
    }
}
