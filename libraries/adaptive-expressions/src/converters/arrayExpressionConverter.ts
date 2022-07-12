/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ArrayExpression } from '../expressionProperties';
import { Expression } from '../expression';

type Input<T> = T[] | string | Expression;

/**
 * `array` to json [ArrayExpression](xref:adaptive-expressions.ArrayExpression) converter.
 *
 * @template T The type of the items of the array.
 */
export class ArrayExpressionConverter<T> {
    /**
     * Converts an array into an [ArrayExpression](xref:adaptive-expressions.ArrayExpression).
     *
     * @param value `array` to convert.
     * @returns The [ArrayExpression](xref:adaptive-expressions.ArrayExpression).
     */
    convert(value: Input<T> | ArrayExpression<T>): ArrayExpression<T> {
        return value instanceof ArrayExpression ? value : new ArrayExpression<T>(value);
    }
}
