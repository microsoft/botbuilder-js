/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogContext } from 'botbuilder-dialogs';
import { BaseInvokeDialog } from './baseInvokeDialog';

export class ReplaceDialog<O extends object = {}> extends BaseInvokeDialog<O> {

    public static declarativeType = 'Microsoft.ReplaceDialog';

    /**
     * Creates a new `ReplaceWithDialog` instance.
     * @param dialogId ID of the dialog to goto.
     * @param options (Optional) static options to pass the dialog.
     */
    public constructor();
    public constructor(dialogIdToCall: string, options?: O);
    public constructor(dialogIdToCall?: string, options?: O) {
        super(dialogIdToCall, options);
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        const dialog = this.resolveDialog(dc);
        const boundOptions = this.bindOptions(dc, options);

        if (this.includeActivity) {
            dc.state.setValue('turn.activityProcessed', false);
        }

        return await dc.replaceDialog(dialog.id, boundOptions);
    }
}