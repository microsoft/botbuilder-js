/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { DialogContext } from 'botbuilder-dialogs';
import { BeginDialog } from './beginDialog';

export class DynamicBeginDialog extends BeginDialog {
    protected bindOptions(dc: DialogContext, options: object): object {
        // use overflow properties of deserialized object instead of the passed in option.
        return super.bindOptions(dc, Object.assign({}, this));
    }
}