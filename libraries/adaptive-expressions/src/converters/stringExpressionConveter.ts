/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression } from '../expression';
import { StringExpression } from '../expressionProperties';

type Input = string | Expression;

export class StringExpressionConverter {
    public convert(value: Input | StringExpression): StringExpression {
        return value instanceof StringExpression ? value : new StringExpression(value);
    }
}
