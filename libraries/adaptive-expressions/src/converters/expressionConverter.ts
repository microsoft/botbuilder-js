/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression} from '../expression';

export class ExpressionConverter {
    public convert(value: string): Expression {
        return Expression.parse(value);
    }
}
