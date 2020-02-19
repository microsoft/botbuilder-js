/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression } from 'botframework-expressions';
import { ExpressionProperty } from '../expressionProperty';

export class BoolExpression extends ExpressionProperty<boolean> {
    public constructor(value?: boolean | string | Expression) {
        if (value == undefined || value == null) {
            super(false);
        } else {
            super(value);
        }
    }
}