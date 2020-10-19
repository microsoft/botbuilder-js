/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression } from '../expression';
import { IntExpression } from '../expressionProperties';

type Input = number | string | Expression;

export class IntExpressionConverter {
    public convert(value: Input | IntExpression): IntExpression {
        return value instanceof IntExpression ? value : new IntExpression(value);
    }
}
