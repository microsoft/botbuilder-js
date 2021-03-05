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
                if (typeof args[0] !== 'object') {
                    return { value: undefined, error: `${args[0]} is not a valid object.` };
                }

                const temp: Record<string, unknown> = args[0] as Record<string, unknown>;
                const prop = args[1] as string;
                if (prop in temp) {
                    error = `${prop} already exists`;
                } else {
                    temp[args[1] as string] = args[2];
                }

                return { value: temp, error };
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
