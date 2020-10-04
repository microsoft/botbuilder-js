/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { NumberExpression } from '../expressionProperties';

export class NumberExpressionConverter {
    public convert(value: string | number): NumberExpression {
        return new NumberExpression(value);
    }
}
