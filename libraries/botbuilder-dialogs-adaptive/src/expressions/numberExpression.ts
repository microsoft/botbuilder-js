/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionProperty } from './expressionProperty';

/**
 * NumberExpression - represents a property which is either a number or a string expression which resolves to a number.
 * @remarks
 * String values are always interpreted as an expression, whether it has '=' prefix or not.
 */
export class NumberExpression extends ExpressionProperty<number> {
    public constructor(value?: number | string) {
        if (value == undefined || value == null) {
            super(0);
        } else {
            super(value);
        }
    }
}