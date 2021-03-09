/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression } from '../expression';
import { EvaluateExpressionDelegate, ExpressionEvaluator, ValueWithError } from '../expressionEvaluator';
import { ExpressionType } from '../expressionType';
import { FunctionUtils } from '../functionUtils';
import { ReturnType } from '../returnType';

/**
 * Add a property and its value, or name-value pair, to a JSON object, and return the updated object.
 * If the object already exists at runtime the function throws an error.
 */
export class AddProperty extends ExpressionEvaluator {
    /**
     * Initializes a new instance of the [AddProperty](xref:adaptive-expressions.AddProperty) class.
     */
    public constructor() {
        super(ExpressionType.AddProperty, AddProperty.evaluator(), ReturnType.Object, AddProperty.validator);
    }

    /**
     * @private
     */
    private static evaluator(): EvaluateExpressionDelegate {
        return FunctionUtils.applyWithError(
            (args: readonly unknown[]): ValueWithError => {
                let error: string;
                const firstChild = args[0];
                const secondChild = args[1];
                if (typeof firstChild !== 'object') {
                    return { value: undefined, error: `${firstChild} is not a valid object.` };
                }

                if (typeof secondChild !== 'string') {
                    return { value: undefined, error: `${secondChild} is not a valid string.` };
                }

                if (secondChild in firstChild) {
                    error = `${secondChild} already exists`;
                } else {
                    firstChild[secondChild] = args[2];
                }

                return { value: firstChild, error };
            }
        );
    }

    /**
     * @private
     */
    private static validator(expression: Expression): void {
        FunctionUtils.validateOrder(expression, undefined, ReturnType.Object, ReturnType.String, ReturnType.Object);
    }
}
