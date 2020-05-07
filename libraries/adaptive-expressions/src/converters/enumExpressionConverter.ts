/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { EnumExpression } from '../expressionProperties';

export class EnumExpressionConverter {
    private _enumValue: object;

    public constructor(enumValue: object) {
        this._enumValue = enumValue;
    }

    public convert(value: string): EnumExpression<any> {
        if (typeof value == 'string') {
            if (this._enumValue.hasOwnProperty(value)) {
                return new EnumExpression<any>(this._enumValue[value as string]);
            }
            if (this._enumValue.hasOwnProperty(value.toLowerCase())) {
                return new EnumExpression<any>(this._enumValue[value.toLowerCase()]);
            }
            return new EnumExpression<any>(`=${ value }`);
        }
        return new EnumExpression<any>(value);
    }
}