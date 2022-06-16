/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression } from '../expression';
import { ExpressionProperty } from './expressionProperty';

/**
 * EnumExpression - represents a property which is either an enum of T or a string expression which resolves to an enum.
 *
 * @remarks
 * String values are always interpreted as an expression whether it has '=' prefix or not, as string values cannot be parsed to enum values.
 */
export class EnumExpression<T> extends ExpressionProperty<T> {
    /**
     * Initializes a new instance of the [EnumExpression<T>](xref:adaptive-expressions.EnumExpression) class.
     *
     * @param value An enum of `T` or a `string` expression which resolves to an `enum`.
     */
    constructor(value: T | string | Expression) {
        super(value);
    }

    /**
     * Set an enum value.
     *
     * @param value value to set.
     */
    setValue(value: T | string | Expression): void {
        super.setValue(undefined);

        if (typeof value == 'string' && !value.startsWith('=')) {
            // Initialize value
            this.value = value as T;
            return;
        }

        super.setValue(value);
    }
}
