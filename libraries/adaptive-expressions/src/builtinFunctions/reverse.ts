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
 * Reverses the order of the elements in a String or Array.
 */
export class Reverse extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the `Reverse` class.
     */
    constructor() {
        super(ExpressionType.Reverse, Reverse.evaluator(), ReturnType.String | ReturnType.Array, Reverse.validator);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError((args: any[]): any => {
            let value = undefined;
            let error = undefined;
            if (typeof args[0] === 'string') {
                value = args[0].split('').reverse().join('');
            } else if (Array.isArray(args[0])) {
                value = args[0].reverse();
            } else {
                error = `${args[0]} is not a string or list.`;
            }

            return { value, error };
        }, FunctionUtils.verifyContainer);
    }

    /**
     * @private
     */
    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, [], ReturnType.String | ReturnType.Array);
    }
}
