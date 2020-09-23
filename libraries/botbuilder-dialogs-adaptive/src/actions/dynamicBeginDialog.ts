/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionProperty } from 'adaptive-expressions';
import { DialogContext } from 'botbuilder-dialogs';
import { BeginDialog } from './beginDialog';

export class DynamicBeginDialog extends BeginDialog {
    protected bindOptions(dc: DialogContext, _options: object): object {
        const options = {};
        for (const key of Object.getOwnPropertyNames(this)) {
            if (!(this[key] instanceof ExpressionProperty)) {
                options[key] = this[key];
            }
        }
        return super.bindOptions(dc, options);
    }
}