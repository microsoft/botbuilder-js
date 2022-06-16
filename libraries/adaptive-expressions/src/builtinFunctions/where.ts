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
import { InternalFunctionUtils } from '../functionUtils.internal';
import { MemoryInterface } from '../memory/memoryInterface';
import { Options } from '../options';
import { ReturnType } from '../returnType';

/**
 * Filter on each element and return the new collection of filtered elements which match a specific condition.
 */
export class Where extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [Where](xref:adaptive-expressions.Where) class.
     */
    constructor() {
        super(ExpressionType.Where, Where.evaluator, ReturnType.Array, InternalFunctionUtils.ValidateLambdaExpression);
    }

    /**
     * @private
     */
    private static evaluator(expression: Expression, state: MemoryInterface, options: Options): ValueWithError {
        let result: any;
        const { value: instance, error: childrenError } = expression.children[0].tryEvaluate(state, options);
        let error = childrenError;
        if (!error) {
            const list = InternalFunctionUtils.convertToList(instance);
            if (!list) {
                error = `${expression.children[0]} is not a collection or structure object to run Where`;
            } else {
                result = [];
                InternalFunctionUtils.lambdaEvaluator(expression, state, options, list, (currentItem, r, e) => {
                    if (InternalFunctionUtils.isLogicTrue(r) && !e) {
                        // add if only if it evaluates to true
                        result.push(currentItem);
                    }

                    return false;
                });

                //reconstruct object if instance is object, otherwise, return array result
                if (!Array.isArray(instance)) {
                    const objResult = {};
                    for (const item of result) {
                        objResult[item.key] = item.value;
                    }

                    result = objResult;
                }
            }
        }

        return { value: result, error };
    }
}
