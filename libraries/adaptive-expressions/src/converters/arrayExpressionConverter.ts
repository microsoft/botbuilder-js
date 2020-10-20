/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ArrayExpression } from '../expressionProperties';
import { Expression } from '../expression';

type Input<T> = T[] | string | Expression;

export class ArrayExpressionConverter<T> {
    public convert(value: Input<T> | ArrayExpression<T>): ArrayExpression<T> {
        return value instanceof ArrayExpression ? value : new ArrayExpression<T>(value);
    }
}
