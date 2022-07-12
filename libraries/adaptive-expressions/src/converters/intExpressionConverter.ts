/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression } from '../expression';
import { IntExpression } from '../expressionProperties';

type Input = number | string | Expression;

/**
 * `string` or `number` to json [IntExpression](xref:adaptive-expressions.IntExpression) converter.
 */
export class IntExpressionConverter {
    /**
     * Converts a `string` or `number` into an [IntExpression](xref:adaptive-expressions.IntExpression).
     *
     * @param value `string` or `number` to convert.
     * @returns The [IntExpression](xref:adaptive-expressions.IntExpression).
     */
    convert(value: Input | IntExpression): IntExpression {
        return value instanceof IntExpression ? value : new IntExpression(value);
    }
}
