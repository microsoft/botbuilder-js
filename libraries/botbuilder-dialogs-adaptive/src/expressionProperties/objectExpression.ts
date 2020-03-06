/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionProperty } from './expressionProperty';

/**
 * ObjectExpression<T> - represents a property which is either an object of type T or a string expression which resolves to an object of type T.
 * @remarks
 * String values are always interpreted as an expression, whether it has '=' prefix or not.
 */
export class ObjectExpression<O extends object = {}> extends ExpressionProperty<O> {
    public constructor(value?: string | O) {
        super(value);
    }
}