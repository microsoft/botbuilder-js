/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Constant } from '../constant';
import { Expression } from '../expression';
import { ExpressionEvaluator, ValueWithError } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { Options } from '../options';
import { ReturnType } from '../returnType';

/**
 * Wrap string interpolation to get real value.
 * For example: stringOrValue('${1}'), would get number 1
 * stringOrValue('${1} item'), would get string "1 item".
 */
export class StringOrValue extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [StringOrValue](xref:adaptive-expressions.StringOrValue) class.
     */
    constructor() {
        super(
            ExpressionType.StringOrValue,
            StringOrValue.evaluator,
            ReturnType.Object,
            FunctionUtils.validateUnaryString
        );
    }

    /**
     * @private
     */
    private static evaluator(expression: Expression, state: any, options: Options): ValueWithError {
        const { value: stringInput, error: childrenError } = expression.children[0].tryEvaluate(state, options);
        let error = childrenError;

        if (typeof stringInput !== 'string') {
            error = 'Parameter should be a string.';
        }

        if (!error) {
            const expr = Expression.parse('`' + stringInput + '`');
            if (expr.children.length === 2) {
                const firstChild = expr.children[0];
                const secondChild = expr.children[1];

                // If the Expression follows this format:
                // concat('', childExpression)
                // return the childExpression result directly.
                if (
                    firstChild instanceof Constant &&
                    firstChild.value.toString() === '' &&
                    !(secondChild instanceof Constant)
                ) {
                    return secondChild.tryEvaluate(state, options);
                }
            }

            return expr.tryEvaluate(state, options);
        }

        return { value: undefined, error };
    }
}
