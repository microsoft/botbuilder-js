/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog, DialogContext, DialogTurnResult } from 'botbuilder-dialogs';
import { StringExpression, BoolExpression } from 'adaptive-expressions';

/**
 * Send an activity back to the user.
 */
export class DeleteActivity<O extends object = {}> extends Dialog<O> {
    public constructor();

    /**
     * Initializes a new instance of the `DeleteActivity` class.
     * @param activityId ID of the activity to update.
     */
    public constructor(activityId?: string) {
        super();
        if (activityId) { this.activityId = new StringExpression(activityId); }
    }

    /**
     * The expression which resolves to the activityId to update.
     */
    public activityId: StringExpression;

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    /**
     * Called when the dialog is started and pushed onto the dialog stack.
     * @remarks Method not implemented.
     * @param dc The `DialogContext` for the current turn of conversation.
     * @param options Optional, initial information to pass to the dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        const value = this.activityId.getValue(dc.state);
        const id = value.toString();
        await dc.context.deleteActivity(id);
        return await dc.endDialog();
    }

    /**
     * Builds the compute Id for the dialog.
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        return `DeleteActivity[${ this.activityId.toString() }]`;
    }
}
