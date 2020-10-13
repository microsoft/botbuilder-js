/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ObjectExpression } from '../expressionProperties';

/**
 * `any` value to json [ObjectExpressionConverter](xref:adaptive-expressions.ObjectExpressionConverter) converter.
 * @typeparam T The type of the value.
 */
export class ObjectExpressionConverter<T extends object = {}> {
    /**
     * Converts value of type `T` into an [ObjectExpressionConverter](xref:adaptive-expressions.ObjectExpressionConverter).
     * @param value Value of type `T` to convert.
     * @returns The [ObjectExpressionConverter](xref:adaptive-expressions.ObjectExpressionConverter).
     */
    public convert(value: T): ObjectExpression<T> {
        return new ObjectExpression<T>(value);
    }
}
