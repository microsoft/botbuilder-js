/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ArrayExpression } from '../expressionProperties';

export class ArrayExpressionConverter<T> {
    public convert(value: T[]): ArrayExpression<T> {
        return new ArrayExpression<T>(value);
    }
}
