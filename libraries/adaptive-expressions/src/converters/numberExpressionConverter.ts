/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { NumberExpression } from '../expressionProperties';

/**
 * `string` or `number` to json [NumberExpression](xref:adaptive-expressions.NumberExpression) converter.
 */
export class NumberExpressionConverter {
    /**
     * Converts a `string` or `number` into a [NumberExpression](xref:adaptive-expressions.NumberExpression).
     * @param value `string` or `number` to convert.
     * @returns The [NumberExpression](xref:adaptive-expressions.NumberExpression).
     */
    public convert(value: string | number): NumberExpression {
        return new NumberExpression(value);
    }
}
