/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression } from 'adaptive-expressions';
import { ExpressionProperty } from '../expressionProperty';

export class ArrayExpression<T> extends ExpressionProperty<T[]> {
    public constructor(value?: T[]| string | Expression | ((arg0: any) => any)) {
        if (typeof value == 'function') {
            super(Expression.lambda(value as (arg0: any) => any));
        } else {
            super(value);
        }
    }
}