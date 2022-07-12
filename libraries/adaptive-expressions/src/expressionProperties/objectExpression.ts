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
 * Represents a property which is either an object of type T or a string expression which resolves
 * to a object of type T.
 *
 * @remarks
 * String values are always interpreted as an expression, whether it has '=' prefix or not.
 * @param T The type of object.
 */
export class ObjectExpression<T> extends ExpressionProperty<T> {
    /**
     * Initializes a new instance of the [ObjectExpression<T>](xref:adaptive-expressions.ObjectExpression) class.
     *
     * @param value An object of type `T` or a `string` expression which resolves to a object of type `T`.
     */
    constructor(value?: T | string | Expression) {
        super(value);
    }
}
