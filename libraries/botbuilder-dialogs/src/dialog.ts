/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext } from 'botbuilder-core';
import { DialogContext } from './dialogContext';

/**
 * Tracking information for a dialog on the stack.
 * @param T (Optional) type of state being persisted for dialog.
 */
export interface DialogInstance<T = any> {
    /**
     * ID of the dialog this instance is for.
     */
     id: string;

    /**
     * The instances persisted state.
     */
     state: T;
}

export enum DialogReason {
    /**
     * A dialog is being started through a call to `DialogContext.beginDialog()`.
     */
     beginCalled = 'beginCalled',

    /**
     * A dialog is being continued through a call to `DialogContext.continueDialog()`.
     */
     continueCalled = 'continueCalled',

    /**
     * A dialog ended normally through a call to `DialogContext.endDialog()`.
     */
    endCalled = 'endCalled',

    /**
     * A dialog is ending because its being replaced through a call to `DialogContext.replaceDialog()`.
     */
    replaceCalled = 'replaceCalled',

    /**
     * A dialog was cancelled as part of a call to `DialogContext.cancelAllDialogs()`.
     */
    cancelCalled = 'cancelCalled',

    /**
     * A step was advanced through a call to `WaterfallStepContext.next()`.
     */
     nextCalled = 'nextCalled'
}

export enum DialogTurnStatus {
    /**
     * Indicates that there is currently nothing on the dialog stack.
     */
     empty = 'empty',

    /**
     * Indicates that the dialog on top is waiting for a response from the user.
     */
     waiting = 'waiting',

    /**
     * Indicates that the dialog completed successfully, the result is available, and the stack is empty.
     */
     complete = 'complete',

    /**
     * Indicates that the dialog was cancelled and the stack is empty.
     */
     cancelled = 'cancelled'
}

/**
 * Returned by `DialogDialog)` and `Dialog.continueDialog()` to indicate whether the dialog is still
 * active after the turn has been processed by the dialog.  This can also be used to access the
 * result of a dialog that just completed.
 * @param T (Optional) type of result returned by the dialog when it calls `dc.endDialog()`.
 */
export interface DialogTurnResult<T = any> {
    /**
     * Gets or sets the current status of the stack.
     */
    status: DialogTurnStatus;

    /**
     * Final result returned by a dialog that just completed. Can be `undefined` even when [hasResult](#hasResult) is true.
     */
    result?: T;
}

/**
 * Base class for all dialogs.
 */
export abstract class Dialog<O extends object = {}> {
    /**
     * Signals the end of a turn by a dialog method or waterfall/sequence step.
     */
    public static EndOfTurn: DialogTurnResult = { status: DialogTurnStatus.waiting };

    /**
     * Unique ID of the dialog.
     */
    public readonly id: string;

    constructor(dialogId: string) {
        this.id = dialogId;
    }

    /**
     * Method called when a new dialog has been pushed onto the stack and is being activated.
     * @param dc The dialog context for the current turn of conversation.
     * @param options (Optional) arguments that were passed to the dialog during `begin()` call that started the instance.
     */
    public abstract beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult>;

    /**
     * (Optional) method called when an instance of the dialog is the active dialog and the user
     * replies with a new activity. The dialog will generally continue to receive the users replies
     * until it calls `DialogContext.endDialog()`, `DialogContext.beginDialog()`, or `DialogContext.prompt()`.
     *
     * If this method is NOT implemented then the dialog will be automatically ended when the user
     * replies.
     * @param dc The dialog context for the current turn of conversation.
     */
    public async continueDialog(dc: DialogContext): Promise<DialogTurnResult> {
        // By default just end the current dialog.
        return dc.endDialog();
    }

    /**
     * (Optional) method called when an instance of the dialog is being returned to from another
     * dialog that was started by the current instance using `DialogContext.beginDialog()` or
     * `DialogContext.prompt()`.
     *
     * If this method is NOT implemented then the dialog will be automatically ended with a call
     * to `DialogContext.endDialog()`. Any result passed from the called dialog will be passed to the
     * active dialogs parent.
     * @param dc The dialog context for the current turn of conversation.
     * @param reason The reason the dialog is being resumed. This will typically be a value of `DialogReason.endCalled`.
     * @param result (Optional) value returned from the dialog that was called. The type of the value returned is dependant on the dialog that was called.
     */
    public async resumeDialog(dc: DialogContext, reason: DialogReason, result?: any): Promise<DialogTurnResult> {
        // By default just end the current dialog and return result to parent.
        return dc.endDialog(result);
    }

    /**
     * (Optional) method called when the dialog has been requested to re-prompt the user for input.
     * @param context Context for the current turn of conversation.
     * @param instance The instance of the current dialog.
     */
    public async repromptDialog(context: TurnContext, instance: DialogInstance): Promise<void> {
        // No-op by default
    }

    /**
     * (Optional) method called when the dialog is ending.
     * @param context Context for the current turn of conversation.
     * @param instance The instance of the current dialog.
     * @param reason The reason the dialog is ending.
     */
    public async endDialog(context: TurnContext, instance: DialogInstance, reason: DialogReason): Promise<void> {
        // No-op by default
    }
}
