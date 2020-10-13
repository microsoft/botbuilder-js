/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ArrayExpression } from '../expressionProperties';

/**
 * `array` to json [ArrayExpression](xref:adaptive-expressions.ArrayExpression) converter.
 * @typeparam T The type of the items of the array.
 */
export class ArrayExpressionConverter<T> {
    /**
     * Converts an array into an [ArrayExpression](xref:adaptive-expressions.ArrayExpression).
     * @param value `array` to convert.
     * @returns The [ArrayExpression](xref:adaptive-expressions.ArrayExpression).
     */
    public convert(value: T[]): ArrayExpression<T> {
        return new ArrayExpression<T>(value);
    }
}
