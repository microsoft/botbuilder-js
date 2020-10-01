/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { EnumExpression } from '../expressionProperties';

/**
 * `string` to json `EnumExpression` converter.
 */
export class EnumExpressionConverter {
    private _enumValue: object;

    /**
     * Initializes a new instance of the `EnumExpressionConverter` class.
     * @param enumValue The enum value of the `string` to convert. 
     */
    public constructor(enumValue: object) {
        this._enumValue = enumValue;
    }

    /**
     * Converts a `string` into an EnumExpression.
     * @param value `string` to convert.
     * @returns The `EnumExpression`.
     */
    public convert(value: string): EnumExpression<any> {
        if (typeof value == 'string') {
            if (this._enumValue.hasOwnProperty(value)) {
                return new EnumExpression<any>(this._enumValue[value as string]);
            }
            return new EnumExpression<any>(`=${value}`);
        }
        return new EnumExpression<any>(value);
    }
}
