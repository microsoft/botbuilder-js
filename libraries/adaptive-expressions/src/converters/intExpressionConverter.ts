/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { IntExpression } from '../expressionProperties';

export class IntExpressionConverter {
    public convert(value: string | number): IntExpression {
        return new IntExpression(value);
    }
}
