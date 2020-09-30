/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ArrayExpression } from '../expressionProperties';

/**
 * Array to json ArrayExpression converter.
 * @typeparam T The type of the items of the array.
 */
export class ArrayExpressionConverter<T> {

    /**
     * Converts an array into an ArrayExpression.
     * @param value Array to convert.
     * @returns The ArrayExpression.
     */
    public convert(value: T[]): ArrayExpression<T> {
        return new ArrayExpression<T>(value);
    }
}
