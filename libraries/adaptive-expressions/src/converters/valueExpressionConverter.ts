/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ValueExpression } from '../expressionProperties';

/**
 * `any` value to json [ValueExpression](xref:adaptive-expressions.ValueExpression) converter.
 */
export class ValueExpressionConverter {
    /**
     * Converts `any` value into a [ValueExpression](xref:adaptive-expressions.ValueExpression).
     *
     * @param value `any` value to convert.
     * @returns The [ValueExpression](xref:adaptive-expressions.ValueExpression).
     */
    convert(value: unknown | ValueExpression): ValueExpression {
        return value instanceof ValueExpression ? value : new ValueExpression(value);
    }
}
