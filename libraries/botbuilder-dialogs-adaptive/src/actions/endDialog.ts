/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BoolProperty, UnknownProperty } from '../properties';
import { evaluateExpression } from '../jsonExtensions';

import {
    BoolExpression,
    BoolExpressionConverter,
    ValueExpression,
    ValueExpressionConverter,
} from 'adaptive-expressions';

import {
    Converter,
    ConverterFactory,
    Dialog,
    DialogConfiguration,
    DialogContext,
    DialogTurnResult,
} from 'botbuilder-dialogs';

export interface EndDialogConfiguration extends DialogConfiguration {
    value?: UnknownProperty;
    disabled?: BoolProperty;
}

/**
 * Command to end the current [Dialog](xref:botbuilder-dialogs.Dialog), returning the `resultProperty` as the result of the dialog.
 */
export class EndDialog<O extends object = {}> extends Dialog<O> implements EndDialogConfiguration {
    static $kind = 'Microsoft.EndDialog';

    /**
     * Creates a new `EndDialog` instance.
     *
     * @param value Optional, a value expression for the result to be returned to the caller.
     */
    constructor(value?: any) {
        super();
        if (value) {
            this.value = new ValueExpression(value);
        }
    }

    /**
     * A value expression for the result to be returned to the caller.
     */
    value: ValueExpression;

    /**
     * An optional expression which if is true will disable this action.
     */
    disabled?: BoolExpression;

    /**
     * @param property The key of the conditional selector configuration.
     * @returns The converter for the selector configuration.
     */
    getConverter(property: keyof EndDialogConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'value':
                return new ValueExpressionConverter();
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
     * @param _options Optional. Initial information to pass to the dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    async beginDialog(dc: DialogContext, _options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        if (this.value) {
            const value = evaluateExpression(dc.state, this.value);

            return await this.endParentDialog(dc, value);
        }

        return await this.endParentDialog(dc);
    }

    /**
     * Ends the parent [Dialog](xref:botbuilder-dialogs.Dialog).
     *
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param result Optional. Value returned from the dialog that was called. The type
     * of the value returned is dependent on the child dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    protected async endParentDialog(dc: DialogContext, result?: any): Promise<DialogTurnResult> {
        if (dc.parent) {
            const turnResult = await dc.parent.endDialog(result);
            turnResult.parentEnded = true;
            return turnResult;
        } else {
            return await dc.endDialog(result);
        }
    }

    /**
     * @protected
     * Builds the compute Id for the [Dialog](xref:botbuilder-dialogs.Dialog).
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        return `EndDialog[${this.value ? this.value.toString() : ''}]`;
    }
}
