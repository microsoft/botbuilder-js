/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression } from 'adaptive-expressions';
import { Dialog } from 'botbuilder-dialogs';
import { ObjectExpression } from './objectExpression';

export class DialogExpression extends ObjectExpression<Dialog> {
    public constructor(value: Dialog | string | Expression) {
        super(value);
    }

    public setValue(value: any): void {
        if (typeof value == 'string') {
            if (!value.startsWith('=')) {
                value = `='${ value }'`;
            }
        }
        super.setValue(value);
    }
}