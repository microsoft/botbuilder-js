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

/**
 * Internal `BeginDialog` action which dynamically binds x.schema/x.dialog to invoke the x.dialog resource with properties as the options.
 */
export class DynamicBeginDialog extends BeginDialog {
    static $kind = 'Microsoft.DynamicBeginDialog';

    /**
     * @protected
     * Evaluates expressions in options.
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param _options The options to bind.
     * @returns An object with the binded options
     */
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
