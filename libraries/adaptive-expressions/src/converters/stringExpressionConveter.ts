/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { StringExpression } from '../expressionProperties';

export class StringExpressionConverter {
    public convert(value: string): StringExpression {
        return new StringExpression(value);
    }
}
