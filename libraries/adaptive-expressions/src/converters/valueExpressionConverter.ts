/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ValueExpression } from '../expressionProperties';

/**
 * `any` value to json `ValueExpression` converter.
 */
export class ValueExpressionConverter {
    /**
     * Converts `any` value into a `ValueExpression`.
     * @param value `any` value to convert.
     * @returns The `ValueExpression`.
     */
    public convert(value: any): ValueExpression {
        return new ValueExpression(value);
    }
}
