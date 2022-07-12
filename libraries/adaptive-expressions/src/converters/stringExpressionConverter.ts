/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression } from '../expression';
import { StringExpression } from '../expressionProperties';

type Input = string | Expression;

/**
 * `string` to json [StringExpression](xref:adaptive-expressions.StringExpression) converter.
 */
export class StringExpressionConverter {
    /**
     * Converts a string into an [StringExpression](xref:adaptive-expressions.StringExpression).
     *
     * @param value `string` to convert.
     * @returns The [StringExpression](xref:adaptive-expressions.StringExpression).
     */
    convert(value: Input | StringExpression): StringExpression {
        return value instanceof StringExpression ? value : new StringExpression(value);
    }
}
