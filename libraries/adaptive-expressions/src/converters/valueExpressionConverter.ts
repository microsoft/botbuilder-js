/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ValueExpression } from '../expressionProperties';

export class ValueExpressionConverter {
    public convert(value: any): ValueExpression {
        return new ValueExpression(value);
    }
}
