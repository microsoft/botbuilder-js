/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ObjectExpression } from '../expressionProperties';

export class ObjectExpressionConverter<T extends object = {}>{
    public convert(value: T): ObjectExpression<T> {
        return new ObjectExpression<T>(value);
    }
}
