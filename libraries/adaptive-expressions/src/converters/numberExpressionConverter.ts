/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression } from '../expression';
import { NumberExpression } from '../expressionProperties';

type Input = number | string | Expression;

/**
 * `string` or `number` to json [NumberExpression](xref:adaptive-expressions.NumberExpression) converter.
 */
export class NumberExpressionConverter {
    /**
     * Converts a `string` or `number` into a [NumberExpression](xref:adaptive-expressions.NumberExpression).
     *
     * @param value `string` or `number` to convert.
     * @returns The [NumberExpression](xref:adaptive-expressions.NumberExpression).
     */
    convert(value: Input | NumberExpression): NumberExpression {
        return value instanceof NumberExpression ? value : new NumberExpression(value);
    }
}
