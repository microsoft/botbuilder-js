/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression } from '../expression';
import { ObjectExpression } from '../expressionProperties';

type Input<T> = T | string | Expression;

/**
 * `any` value to json [ObjectExpressionConverter](xref:adaptive-expressions.ObjectExpressionConverter) converter.
 *
 * @template T The type of the value.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export class ObjectExpressionConverter<T extends object = {}> {
    /**
     * Converts value of type `T` into an [ObjectExpression](xref:adaptive-expressions.ObjectExpression).
     *
     * @param value Value of type `T` to convert.
     * @returns The [ObjectExpression](xref:adaptive-expressions.ObjectExpression).
     */
    convert(value: Input<T> | ObjectExpression<T>): ObjectExpression<T> {
        return value instanceof ObjectExpression ? value : new ObjectExpression<T>(value);
    }
}
