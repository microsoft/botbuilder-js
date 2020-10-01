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
 * Merge two JSON objects into one JSON object.
 */
export class Merge extends ExpressionEvaluator {
    public constructor() {
        super(ExpressionType.Merge, Merge.evaluator(), ReturnType.Object, Merge.validator);
    }

    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applySequenceWithError((args: any[]): any => {
            let value: any;
            let error: string;
            if (
                typeof args[0] === 'object' &&
                !Array.isArray(args[0]) &&
                typeof args[1] === 'object' &&
                !Array.isArray(args[1])
            ) {
                Object.assign(args[0], args[1]);
                value = args[0];
            } else {
                error = `The argumets ${args[0]} and ${args[1]} must be JSON objects.`;
            }

            return { value, error };
        });
    }

    private static validator(expression: Expression): void {
        FunctionUtils.validateArityAndAnyType(expression, 2, Number.MAX_SAFE_INTEGER);
    }
}
