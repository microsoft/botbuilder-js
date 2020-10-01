/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogContext, Dialog } from 'botbuilder-dialogs';
import { BoolExpression, StringExpression } from 'adaptive-expressions';

/**
 * Deletes a property from memory.
 */
export class DeleteProperty<O extends object = {}> extends Dialog<O> {
    public constructor();

    /**
     * Creates a new `DeleteProperty` instance.
     * @param property (Optional) property to delete.
     */
    public constructor(property?: string) {
        super();
        if (property) { this.property = new StringExpression(property); }
    }

    /**
     * The property to delete.
     */
    public property: StringExpression;

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    /**
     * Starts a new dialog and pushes it onto the dialog stack.
     * @param dc The `DialogContext` for the current turn of conversation.
     * @param result Optional. Value returned from the dialog that was called. The type 
     * of the value returned is dependent on the child dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        dc.state.deleteValue(this.property.getValue(dc.state));
        return await dc.endDialog();
    }

    /**
     * @protected
     * Builds the compute Id for the dialog.
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        return `DeleteProperty[${ this.property.toString() }]`;
    }
}
