/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression } from 'adaptive-expressions';
import { ExpressionProperty } from '../expressionProperty';

export class EnumExpression<T> extends ExpressionProperty<T> {
    public constructor(value: number | string | Expression) {
        super(value);
    }
}