/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { DialogContext } from 'botbuilder-dialogs';
import { BeginDialog } from './beginDialog';

/**
 * Internal BeginDialog action which dynamically binds x.schema/x.dialog to invoke the x.dialog resource with properties as the options.
 */
export class DynamicBeginDialog extends BeginDialog {

    /**
     * @protected
     * Evaluates expressions in options.
     * @param dc The `DialogContext` for the current turn of conversation.
     * @param options The options to bind.
     */
    protected bindOptions(dc: DialogContext, options: object): object {
        // use overflow properties of deserialized object instead of the passed in option.
        return super.bindOptions(dc, Object.assign({}, this));
    }
}
