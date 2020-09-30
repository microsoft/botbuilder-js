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
 * @remarks
 * String values are always interpreted as an expression, whether it has '=' prefix or not.
 * @param T Type of object in the array.
 */
export class ArrayExpression<T> extends ExpressionProperty<T[]> {
    /**
     * Initializes a new instance of the `ArrayExpression<T>` class.
     * @param value Value of `T[]` or a `string` expression to bind to an `T[]`.
     */
    public constructor(value?: T[] | string | Expression) {
        super(value);
    }
}
