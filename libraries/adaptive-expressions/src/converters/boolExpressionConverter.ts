/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { BoolExpression } from '../expressionProperties';

/**
 * `any` value to json `BoolExpression` converter.
 */
export class BoolExpressionConverter {
    /**
     * Converts `any` value into a `BoolExpression`.
     * @param value `any` value to convert.
     * @returns The `BoolExpression`.
     */
    public convert(value: any): BoolExpression {
        return new BoolExpression(value);
    }
}
