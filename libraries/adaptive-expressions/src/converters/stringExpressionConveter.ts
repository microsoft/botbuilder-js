/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { StringExpression } from '../expressionProperties';

/**
 * `string` to json [StringExpression](xref:adaptive-expressions.StringExpression) converter.
 */
export class StringExpressionConverter {
    /**
     * Converts a string into an [StringExpression](xref:adaptive-expressions.StringExpression).
     * @param value `string` to convert.
     * @returns The [StringExpression](xref:adaptive-expressions.StringExpression).
     */
    public convert(value: string): StringExpression {
        return new StringExpression(value);
    }
}
