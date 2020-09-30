/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { StringExpression } from '../expressionProperties';

/**
 * String to json StringExpression converter.
 */
export class StringExpressionConverter {

    /**
     * Converts a string into an StringExpression.
     * @param value Any value to convert.
     * @returns The StringExpression.
     */
    public convert(value: string): StringExpression {
        return new StringExpression(value);
    }
}
