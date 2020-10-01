/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogContext, Dialog } from 'botbuilder-dialogs';
import { ValueExpression, BoolExpression } from 'adaptive-expressions';
import { replaceJsonRecursively } from '../jsonExtensions';

/**
 * Command to end the current dialog, returning the resultProperty as the result of the dialog.
 */
export class EndDialog<O extends object = {}> extends Dialog<O> {
    public constructor();

    /**
     * Creates a new `EndDialog` instance.
     * @param value Optional, a value expression for the result to be returned to the caller.
     */
    public constructor(value?: any) {
        super();
        if (value) { this.value = new ValueExpression(value); }
    }

    /**
     * A value expression for the result to be returned to the caller.
     */
    public value: ValueExpression;

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    /**
     * Starts a new dialog and pushes it onto the dialog stack.
     * @param dc The `DialogContext` for the current turn of conversation.
     * @param result Optional, value returned from the dialog that was called. The type 
     * of the value returned is dependent on the child dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        if (this.value) {
            let value = this.value.getValue(dc.state);
            
            if (value) {
                value = replaceJsonRecursively(dc.state, value);
            }

            return await this.endParentDialog(dc, value);
        }

        return await this.endParentDialog(dc);
    }

    /**
     * Ends the parent dialog.
     * @param dc The `DialogContext` for the current turn of conversation.
     * @param result Optional, value returned from the dialog that was called. The type 
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
     * Builds the compute Id for the dialog.
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        return `EndDialog[${ this.value ? this.value.toString() : '' }]`;
    }
}
