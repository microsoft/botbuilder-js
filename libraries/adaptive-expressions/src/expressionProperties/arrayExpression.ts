/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ExpressionProperty } from './expressionProperty';
import { Expression } from '../expression';

/**
 * Represents a property which is either a value of array of T or a string expression to bind to a
 * array of T.
 *
 * @remarks
 * String values are always interpreted as an expression, whether it has '=' prefix or not.
 * @param T Type of object in the array.
 */
export class ArrayExpression<T> extends ExpressionProperty<T[]> {
    /**
     * Initializes a new instance of the [ArrayExpression<T>](xref:adaptive-expressions.ArrayExpression) class.
     *
     * @param value Value of `T[]` or a `string` expression to bind to a `T[]`.
     */
    constructor(value?: T[] | string | Expression) {
        super(value);
    }

    /**
     * Set an array value.
     *
     * @param value Value to set.
     */
    setValue(value: T[] | string | Expression): void {
        if (value != null && !Array.isArray(value) && typeof value !== 'string' && !(value instanceof Expression)) {
            throw new Error('ArrayExpression accepts string, array or Expression as the value.');
        }

        super.setValue(value);
    }
}
