/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { StringExpression } from '../expressionProperties';

/**
 * `string` to json `StringExpression` converter.
 */
export class StringExpressionConverter {
    /**
     * Converts a string into an `StringExpression`.
     * @param value `string` to convert.
     * @returns The `StringExpression`.
     */
    public convert(value: string): StringExpression {
        return new StringExpression(value);
    }
}
