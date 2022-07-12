/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BaseInvokeDialog, BaseInvokeDialogConfiguration } from './baseInvokeDialog';
import { BoolProperty, StringProperty } from '../properties';

import {
    StringExpression,
    BoolExpression,
    StringExpressionConverter,
    BoolExpressionConverter,
} from 'adaptive-expressions';

import {
    Converter,
    ConverterFactory,
    DialogTurnResult,
    DialogContext,
    DialogReason,
    TurnPath,
} from 'botbuilder-dialogs';

export interface BeginDialogConfiguration extends BaseInvokeDialogConfiguration {
    resultProperty?: StringProperty;
    disabled?: BoolProperty;
}

/**
 * Action which begins executing another [Dialog](xref:botbuilder-dialogs.Dialog), when it is done, it will return to the caller.
 */
export class BeginDialog<O extends object = {}> extends BaseInvokeDialog<O> implements BeginDialogConfiguration {
    static $kind = 'Microsoft.BeginDialog';

    /**
     * Creates a new `BeginDialog` instance.
     *
     * @param dialogIdToCall ID of the dialog to call.
     * @param options (Optional) static options to pass the called dialog.
     */
    constructor(dialogIdToCall: string, options?: O);

    /**
     * Creates a new [BeginDialog](xref:botbuilder-dialogs-adaptive.BeginDialog) instance.
     *
     * @param dialogIdToCall Optional. ID of the [Dialog](xref:botbuilder-dialogs.Dialog) to call.
     * @param options Optional. Static options to pass the called dialog.
     */
    constructor(dialogIdToCall?: string, options?: O) {
        super(dialogIdToCall, options);
    }

    /**
     * (Optional) property path to store the dialog result in.
     */
    resultProperty?: StringExpression;

    /**
     * An optional expression which if is true will disable this action.
     */
    disabled?: BoolExpression;

    /**
     * @param property The key of the conditional selector configuration.
     * @returns The converter for the selector configuration.
     */
    getConverter(property: keyof BeginDialogConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'resultProperty':
                return new StringExpressionConverter();
            case 'disabled':
                return new BoolExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

    /**
     * Called when the [Dialog](xref:botbuilder-dialogs.Dialog) is started and pushed onto the dialog stack.
     *
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param options Optional. Initial information to pass to the dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
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
     * Called when a child [Dialog](xref:botbuilder-dialogs.Dialog) completed its turn, returning control to this dialog.
     *
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param reason [DialogReason](xref:botbuilder-dialogs.DialogReason), reason why the dialog resumed.
     * @param result Optional. Value returned from the dialog that was called. The type
     * of the value returned is dependent on the child dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    async resumeDialog(dc: DialogContext, reason: DialogReason, result: any = null): Promise<DialogTurnResult> {
        if (this.resultProperty) {
            dc.state.setValue(this.resultProperty.getValue(dc.state), result);
        }
        return await dc.endDialog(result);
    }
}
