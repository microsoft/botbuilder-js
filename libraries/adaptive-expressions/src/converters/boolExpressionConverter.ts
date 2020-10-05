/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { BoolExpression } from '../expressionProperties';

export class BoolExpressionConverter {
    public convert(value: any): BoolExpression {
        return new BoolExpression(value);
    }
}
