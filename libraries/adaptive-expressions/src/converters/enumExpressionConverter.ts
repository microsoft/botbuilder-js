/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { EnumExpression } from '../expressionProperties';
import { Expression } from '../expression';

type Input<T> = T | string | Expression;

/**
 * `string` to json [EnumExpression](xref:adaptive-expressions.EnumExpression) converter.
 */
export class EnumExpressionConverter<T> {
    private _enumValue: unknown;

    /**
     * Initializes a new instance of the [EnumExpressionConverter](xref:adaptive-expressions.EnumExpressionConverter) class.
     * @param enumValue The enum value of the `string` to convert.
     */
    public constructor(enumValue: unknown) {
        this._enumValue = enumValue;
    }

    /**
     * Converts a `string` into an [EnumExpression](xref:adaptive-expressions.EnumExpression).
     * @param value `string` to convert.
     * @returns The [EnumExpression](xref:adaptive-expressions.EnumExpression).
     */
    public convert(value: Input<T> | EnumExpression<T>): EnumExpression<T> {
        if (value instanceof EnumExpression) {
            return value;
        }
        if (typeof value == 'string') {
            if (Object.prototype.hasOwnProperty.call(this._enumValue, value)) {
                return new EnumExpression<T>(this._enumValue[value as string]);
            }
            return new EnumExpression<T>(`=${value}`);
        }
        return new EnumExpression<T>(value);
    }
}
