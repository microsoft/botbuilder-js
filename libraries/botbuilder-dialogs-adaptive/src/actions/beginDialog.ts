/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogContext, DialogReason, TurnPath } from 'botbuilder-dialogs';
import { BaseInvokeDialog } from './baseInvokeDialog';
import { StringExpression, BoolExpression } from '../expressionProperties';

export class BeginDialog<O extends object = {}> extends BaseInvokeDialog<O> {
    /**
     * Creates a new `BeginDialog` instance.
     * @param dialogIdToCall ID of the dialog to call.
     * @param options (Optional) static options to pass the called dialog.
     */
    public constructor();
    public constructor(dialogIdToCall: string, options?: O)
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

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        const dialog = this.resolveDialog(dc);
        const boundOptions = this.bindOptions(dc, options);
        dc.state.setValue(TurnPath.activityProcessed, this.activityProcessed.getValue(dc.state));
        return await dc.beginDialog(dialog.id, boundOptions);
    }

    public async resumeDialog(dc: DialogContext, reason: DialogReason, result: any = null): Promise<DialogTurnResult> {
        if (this.resultProperty) {
            dc.state.setValue(this.resultProperty.getValue(dc.state), result);
        }
        return await dc.endDialog(result);
    }
}