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

export class EnumExpressionConverter<T> {
    private _enumValue: unknown;

    public constructor(enumValue: unknown) {
        this._enumValue = enumValue;
    }

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
