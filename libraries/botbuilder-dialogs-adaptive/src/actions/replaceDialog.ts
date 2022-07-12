/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BaseInvokeDialog, BaseInvokeDialogConfiguration } from './baseInvokeDialog';
import { BoolExpression, BoolExpressionConverter } from 'adaptive-expressions';
import { BoolProperty } from '../properties';
import { Converter, ConverterFactory, DialogContext, DialogTurnResult, TurnPath } from 'botbuilder-dialogs';

export interface ReplaceDialogConfiguration extends BaseInvokeDialogConfiguration {
    disabled?: BoolProperty;
}

/**
 * Action which calls another [Dialog](xref:botbuilder-dialogs.Dialog), when it is done it will go to the caller's parent dialog.
 */
export class ReplaceDialog<O extends object = {}> extends BaseInvokeDialog<O> implements ReplaceDialogConfiguration {
    static $kind = 'Microsoft.ReplaceDialog';

    /**
     * Creates a new [ReplaceDialog](xref:botbuilder-dialogs-adaptive.ReplaceDialog) instance.
     *
     * @param dialogId ID of the [Dialog](xref:botbuilder-dialogs.Dialog) to goto.
     * @param options Optional, static options to pass the [Dialog](xref:botbuilder-dialogs.Dialog).
     */
    constructor(dialogIdToCall: string, options?: O);

    /**
     * Creates a new [ReplaceDialog](xref:botbuilder-dialogs-adaptive.ReplaceDialog) instance.
     *
     * @param dialogIdToCall Optional. ID of the [Dialog](xref:botbuilder-dialogs.Dialog) to goto.
     * @param options Optional. Static options to pass the [Dialog](xref:botbuilder-dialogs.Dialog).
     */
    constructor(dialogIdToCall?: string, options?: O) {
        super(dialogIdToCall, options);
    }

    /**
     * An optional expression which if is true will disable this action.
     */
    disabled?: BoolExpression;

    /**
     * @param property The key of the conditional selector configuration.
     * @returns The converter for the selector configuration.
     */
    getConverter(property: keyof ReplaceDialogConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'disabled':
                return new BoolExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

    /**
     * Starts a new [Dialog](xref:botbuilder-dialogs.Dialog) and pushes it onto the dialog stack.
     *
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param options Optional. Initial information to pass to the dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return dc.endDialog();
        }

        const dialog = this.resolveDialog(dc);
        const boundOptions = this.bindOptions(dc, options);

        // set the activity processed state (default is true)
        dc.state.setValue(TurnPath.activityProcessed, this.activityProcessed.getValue(dc.state));

        return dc.parent.replaceDialog(dialog.id, boundOptions);
    }
}
