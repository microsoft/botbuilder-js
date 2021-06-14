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
    private readonly lowercaseIndex: Record<string, string>;

    /**
     * Initializes a new instance of the [EnumExpressionConverter](xref:adaptive-expressions.EnumExpressionConverter) class.
     *
     * @param enumValue The enum value of the `string` to convert.
     */
    constructor(private readonly enumValue: unknown) {
        this.lowercaseIndex = Object.keys(enumValue || {}).reduce((acc, key) => {
            acc[key.toLowerCase()] = key;

            return acc;
        }, {});
    }

    /**
     * Converts a `string` into an [EnumExpression](xref:adaptive-expressions.EnumExpression).
     *
     * @param value `string` to convert.
     * @returns The [EnumExpression](xref:adaptive-expressions.EnumExpression).
     */
    convert(value: Input<T> | EnumExpression<T>): EnumExpression<T> {
        if (value instanceof EnumExpression) {
            return value;
        }

        if (typeof value === 'string') {
            let enumValue = this.enumValue[value];
            if (enumValue === undefined) {
                enumValue = this.enumValue[this.lowercaseIndex[value]];
            }

            if (enumValue !== undefined) {
                return new EnumExpression<T>(enumValue as Input<T>);
            }

            return new EnumExpression<T>(`=${value}`);
        }

        return new EnumExpression<T>(value);
    }
}
