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

export interface RepeatDialogConfiguration extends BaseInvokeDialogConfiguration {
    disabled?: BoolProperty;
    allowLoop?: BoolProperty;
}

/**
 * Action which repeats the active [Dialog](xref:botbuilder-dialogs.Dialog) (restarting it).
 */
export class RepeatDialog<O extends object = {}> extends BaseInvokeDialog<O> implements RepeatDialogConfiguration {
    static $kind = 'Microsoft.RepeatDialog';

    constructor();

    /**
     * Initializes a new instance of the [RepeatDialog](xref:botbuilder-dialogs-adaptive.RepeatDialog) class.
     *
     * @param options Optional. Object with additional options.
     */
    constructor(options?: O) {
        super(undefined, options);
    }

    /**
     * An optional expression which if is true will disable this action.
     */
    disabled?: BoolExpression;

    /**
     * An optional expression which if is true will allow loop of the repeated dialog.
     */
    allowLoop?: BoolExpression;

    /**
     * @param property The key of the conditional selector configuration.
     * @returns The converter for the selector configuration.
     */
    getConverter(property: keyof RepeatDialogConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'disabled':
                return new BoolExpressionConverter();
            case 'allowLoop':
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
            return await dc.endDialog();
        }

        const boundOptions = this.bindOptions(dc, options);
        const targetDialogId = dc.parent.activeDialog.id;

        const repeatedIds: string[] = dc.state.getValue(TurnPath.repeatedIds, []);
        if (repeatedIds.includes(targetDialogId)) {
            if (this.allowLoop == null || this.allowLoop.getValue(dc.state) == false) {
                throw new Error(`Recursive loop detected, ${targetDialogId} cannot be repeated twice in one turn.`);
            }
        } else {
            repeatedIds.push(targetDialogId);
        }

        dc.state.setValue(TurnPath.repeatedIds, repeatedIds);

        // set the activity processed state (default is true)
        dc.state.setValue(TurnPath.activityProcessed, this.activityProcessed.getValue(dc.state));

        const turnResult = await dc.parent.replaceDialog(dc.parent.activeDialog.id, boundOptions);
        turnResult.parentEnded = true;
        return turnResult;
    }
}
