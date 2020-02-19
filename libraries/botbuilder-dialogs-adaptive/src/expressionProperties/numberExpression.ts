/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionProperty } from '../expressionProperty';
import { Expression } from 'botframework-expressions';

export class NumberExpression extends ExpressionProperty<number> {
    public constructor(value?: number | string | Expression) {
        if (value == undefined || value == null) {
            super(0);
        } else {
            super(value);
        }
    }
}