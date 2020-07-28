/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression } from '../expression';
import { EvaluateExpressionDelegate, ExpressionEvaluator } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { ReturnType } from '../returnType';

/**
 * Return a collection that has only the common items across the specified collections.
 * To appear in the result, an item must appear in all the collections passed to this function.
 * If one or more items have the same name,
 * the last item with that name appears in the result.
 */
export class Intersection extends ExpressionEvaluator {
    public constructor() {
        super(ExpressionType.Intersection, Intersection.evaluator(), ReturnType.Array, Intersection.validator);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.apply(
            (args: any[]): any => {
                let result: any[] = args[0];
                for (const arg of args) {
                    result = result.filter((e: any): boolean => arg.indexOf(e) > -1);
                }

                return Array.from(new Set(result));
            },
            FunctionUtils.verifyList);
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 1, Number.MAX_SAFE_INTEGER, ReturnType.Array);
    }
}