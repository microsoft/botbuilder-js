/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ExpressionProperty } from './expressionProperty';
import { Expression } from '../expression';
import { FunctionUtils } from '../functionUtils';

/**
 * Represents a property which is either a float or a string expression which resolves to a float.
 *
 * @remarks
 * String values are always interpreted as an expression, whether it has '=' prefix or not.
 */
export class NumberExpression extends ExpressionProperty<number> {
    /**
     * Initializes a new instance of the [NumberExpression](xref:adaptive-expressions.NumberExpression) class.
     *
     * @param value A float `number` or `string` expression which resolves to a float `number`.
     */
    constructor(value?: number | string | Expression) {
        super(value, 0);
    }

    /**
     * Set a number value.
     *
     * @param value Value to set.
     */
    setValue(value: number | string | Expression): void {
        if (
            value != null &&
            !FunctionUtils.isNumber(value) &&
            typeof value !== 'string' &&
            !(value instanceof Expression)
        ) {
            throw new Error('NumberExpression accepts string, number or Expression as the value.');
        }

        super.setValue(value);
    }
}
