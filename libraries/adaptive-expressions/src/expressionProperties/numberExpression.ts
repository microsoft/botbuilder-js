/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ExpressionProperty } from './expressionProperty';
import { Expression } from '../expression';

/**
 * Represents a property which is either a float or a string expression which resolves to a float.
 * @remarks
 * String values are always interpreted as an expression, whether it has '=' prefix or not.
 */
export class NumberExpression extends ExpressionProperty<number> {
    public constructor(value?: number | string | Expression) {
        super(value, 0);
    }
}