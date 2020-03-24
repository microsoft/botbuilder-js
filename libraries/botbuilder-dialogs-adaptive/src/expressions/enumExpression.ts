/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression } from 'adaptive-expressions';
import { ExpressionProperty } from './expressionProperty';

/**
 * EnumExpression - represents a property which is either an enum of T or a string expression which resolves to an enum.
 * @remarks
 * String values are always interpreted as an expression whether it has '=' prefix or not, as string values cannot be parsed to enum values.
 */
export class EnumExpression<T> extends ExpressionProperty<T> {
    public constructor(value: T | string | Expression) {
        super(value);
    }
}