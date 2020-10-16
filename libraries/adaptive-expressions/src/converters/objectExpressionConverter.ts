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

export class ObjectExpressionConverter<T extends object = {}> {
    public convert(value: Input<T> | ObjectExpression<T>): ObjectExpression<T> {
        return value instanceof ObjectExpression ? value : new ObjectExpression<T>(value);
    }
}
