/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { BoolExpression } from '../expressionProperties';
import { Expression } from '../expression';

type Input = boolean | string | Expression;

export class BoolExpressionConverter {
    public convert(value: Input | BoolExpression): BoolExpression {
        return value instanceof BoolExpression ? value : new BoolExpression(value);
    }
}
