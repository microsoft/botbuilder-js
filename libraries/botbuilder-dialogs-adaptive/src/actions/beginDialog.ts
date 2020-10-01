/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogContext, DialogReason, TurnPath } from 'botbuilder-dialogs';
import { BaseInvokeDialog } from './baseInvokeDialog';
import { StringExpression, BoolExpression } from 'adaptive-expressions';

/**
 * Action which begins executing another dialog, when it is done, it will return to the caller.
 */
export class BeginDialog<O extends object = {}> extends BaseInvokeDialog<O> {
    /**
     * Creates a new `BeginDialog` instance.
     * @param dialogIdToCall ID of the dialog to call.
     * @param options (Optional) static options to pass the called dialog.
     */
    public constructor();
    public constructor(dialogIdToCall: string, options?: O)
    
    /**
     * Creates a new `BeginDialog` instance.
     * @param dialogIdToCall Optional, ID of the dialog to call.
     * @param options Optional, static options to pass the called dialog.
     */
    public constructor(dialogIdToCall?: string, options?: O) {
        super(dialogIdToCall, options);
    }

    /**
     * (Optional) property path to store the dialog result in.
     */
    public resultProperty?: StringExpression;

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    /**
     * Called when the dialog is started and pushed onto the dialog stack.
     * @param dc The `DialogContext` for the current turn of conversation.
     * @param options Optional, initial information to pass to the dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        const dialog = this.resolveDialog(dc);

        // use bindingOptions to bind to the bound options
        const boundOptions = this.bindOptions(dc, options);

        // set the activity processed state (default is true)
        dc.state.setValue(TurnPath.activityProcessed, this.activityProcessed.getValue(dc.state));
        return await dc.beginDialog(dialog.id, boundOptions);
    }

    /**
     * Called when a child dialog completed its turn, returning control to this dialog.
     * @param dc The `DialogContext` for the current turn of conversation.
     * @param reason Reason why the dialog resumed.
     * @param result Optional, value returned from the dialog that was called. The type 
     * of the value returned is dependent on the child dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    public async resumeDialog(dc: DialogContext, reason: DialogReason, result: any = null): Promise<DialogTurnResult> {
        if (this.resultProperty) {
            dc.state.setValue(this.resultProperty.getValue(dc.state), result);
        }
        return await dc.endDialog(result);
    }
}
