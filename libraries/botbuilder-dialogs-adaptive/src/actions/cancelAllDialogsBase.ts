/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogContext, Dialog, TurnPath, DialogEvents } from 'botbuilder-dialogs';
import { StringExpression, BoolExpression, ValueExpression } from 'adaptive-expressions';

/**
 * Base class for CancelAllDialogs api.
 */
export class CancelAllDialogsBase<O extends object = {}> extends Dialog<O> {
    public constructor();

    /**
     * Initializes a new instance of the `CancelAllDialogsBase` class.
     * @param eventName Expression for event name.
     * @param eventValue Optional, expression for event value.
     * @param isCancelAll Set to `true` to cancel all dialogs; `false` otherwise.
     */
    public constructor(eventName: string, eventValue?: string, isCancelAll?: boolean);

    /**
     * Initializes a new instance of the `CancelAllDialogsBase` class.
     * @param eventName Optional, expression for event name.
     * @param eventValue Optional, expression for event value.
     * @param isCancelAll Set to `true` to cancel all dialogs; `false` otherwise.
     */
    public constructor(eventName?: string, eventValue?: string, isCancelAll = true) {
        super();
        if (eventName) {
            this.eventName = new StringExpression(eventName);
        }
        if (eventValue) {
            this.eventValue = new ValueExpression(eventValue);
        }
        this.cancelAll = isCancelAll;

    }

    /**
     * Expression for event name.
     */
    public eventName: StringExpression;

    /**
     * Expression for event value.
     */
    public eventValue: ValueExpression;

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled: BoolExpression;

    /**
     * A value indicating whether to have the new dialog should process the activity.
     */
    public activityProcessed: BoolExpression = new BoolExpression(true);


    /**
     * A value indicating whether to cancel all dialogs.
     */
    public cancelAll: boolean;

    /**
     * Called when the dialog is started and pushed onto the dialog stack.
     * @remarks Method not implemented.
     * @param dc The `DialogContext` for the current turn of conversation.
     * @param options Optional, initial information to pass to the dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    public async beginDialog(dc: DialogContext, options: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        var eventName = this.eventName && this.eventName.getValue(dc.state);
        var eventValue = this.eventValue && this.eventValue.getValue(dc.state);

        if (this.activityProcessed  && this.activityProcessed.getValue(dc.state) == false ) {
            // mark that this hasn't been recognized
            dc.state.setValue(TurnPath.activityProcessed, false);

            // emit ActivityReceived, which will tell parent it's supposed to handle recognition.
            eventName = DialogEvents.activityReceived;
            eventValue = dc.context.activity;

        }
        if (!dc.parent) {
            return await dc.cancelAllDialogs(this.cancelAll, eventName, eventValue);
        } else {
            const turnResult = await dc.cancelAllDialogs(this.cancelAll, eventName, eventValue);
            turnResult.parentEnded = true;
            return turnResult;
        }
    }
    
    /**
     * @protected
     * Builds the compute Id for the dialog.
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        return `${ this.constructor.name }[${ this.eventName ? this.eventName.toString() : '' }]`;
    }
}
