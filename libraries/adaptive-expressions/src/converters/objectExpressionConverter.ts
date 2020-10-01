/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ObjectExpression } from '../expressionProperties';

/**
 * `any` value to json `ObjectExpressionConverter` converter.
 * @typeparam T The type of the value.
 */
export class ObjectExpressionConverter<T extends object = {}> {
    /**
     * Converts value of type `T` into an `ObjectExpression`.
     * @param value Value of type `T` to convert.
     * @returns The `ObjectExpression`.
     */
    public convert(value: T): ObjectExpression<T> {
        return new ObjectExpression<T>(value);
    }
}
