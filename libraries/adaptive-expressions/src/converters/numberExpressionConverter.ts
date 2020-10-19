/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression } from '../expression';
import { NumberExpression } from '../expressionProperties';

type Input = number | string | Expression;

export class NumberExpressionConverter {
    public convert(value: Input | NumberExpression): NumberExpression {
        return value instanceof NumberExpression ? value : new NumberExpression(value);
    }
}
