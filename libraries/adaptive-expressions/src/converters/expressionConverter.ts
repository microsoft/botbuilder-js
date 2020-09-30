/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression} from '../expression';

/**
 * String to json Expression converter.
 */
export class ExpressionConverter {

    /**
     * Converts a string into an Expression.
     * @param value String to convert.
     * @returns The Expression.
     */
    public convert(value: string): Expression {
        return Expression.parse(value);
    }
}
