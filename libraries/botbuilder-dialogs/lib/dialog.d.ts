/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext } from '../../botbuilder/lib';
import { DialogContext } from './dialogContext';
/**
 * Tracking information for a dialog on the stack.
 * @param T (Optional) type of state being persisted for dialog.
 */
export interface DialogInstance<T = any> {
    /** ID of the dialog this instance is for. */
    id: string;
    /** The instances persisted state. */
    state: T;
}
/**
 * Returned by `Dialog.begin()` and `Dialog.continue()` to indicate whether the dialog is still
 * active after the turn has been processed by the dialog.  This can also be used to access the
 * result of a dialog that just completed.
 * @param T (Optional) type of result returned by the dialog when it calls `dc.end()`.
 */
export interface DialogTurnResult<T = any> {
    /** If `true` a dialog is still active on the dialog stack. */
    hasActive: boolean;
    /** If `true` the dialog that was on the stack just completed and the final [result](#result) is available. */
    hasResult: boolean;
    /** Final result returned by a dialog that just completed. Can be `undefined` even when [hasResult](#hasResult) is true. */
    result?: T;
}
/**
 * Base class for all dialogs.
 * @param R (Optional) type of result that's expected to be returned by the dialog.
 * @param O (Optional) options that can be passed into the [begin()](#begin) method.
 */
export declare abstract class Dialog<R = any, O = {}> {
    /** Signals the end of a turn by a dialog method or waterfall/sequence step.  */
    static EndOfTurn: DialogTurnResult;
    /**
     * Starts the dialog when its called in isolation from a bot that isn't dialog based.
     *
     * @remarks
     * The bot is responsible for maintaining the sticky-ness of the dialog. To do that it should
     * persist the state object it passed into the dialog as part of its overall state when the
     * turn completes. When the user replies it then needs to pass the persisted state object into
     * a call to the dialogs [continue()](#continue) method.
     *
     * Depending on the dialog, its possible for the dialog to finish immediately so it's advised
     * to check the completion object returned by `begin()` and ensure that the dialog is still
     * active before continuing.
     *
     * ```JavaScript
     * const state = {};
     * const completion = await dialog.begin(context, state);
     * if (completion.isCompleted) {
     *     const value = completion.result;
     * }
     * ```
     * @param context Context for the current turn of the conversation with the user.
     * @param state A state object that the dialog will use to persist its current state. This should be an empty object which the dialog will populate. The bot should persist this with its other conversation state for as long as the dialog is still active.
     * @param options (Optional) additional options supported by the dialog.
     */
    begin(context: TurnContext, state: object, options?: O): Promise<DialogTurnResult<R>>;
    /**
     * Passes a users reply to a dialog thats being used in isolation.
     *
     * @remarks
     * The bot should keep calling `continue()` for future turns until the dialog returns a
     * completion object with `isCompleted == true`. To cancel or interrupt the prompt simply
     * delete the `state` object being persisted.
     *
     * ```JavaScript
     * const completion = await dialog.continue(context, state);
     * if (completion.isCompleted) {
     *     const value = completion.result;
     * }
     * ```
     * @param context Context for the current turn of the conversation with the user.
     * @param state A state object that was previously initialized by a call to [begin()](#begin).
     */
    continue(context: TurnContext, state: object): Promise<DialogTurnResult<R>>;
    /**
     * Method called when a new dialog has been pushed onto the stack and is being activated.
     * @param dc The dialog context for the current turn of conversation.
     * @param dialogArgs (Optional) arguments that were passed to the dialog during `begin()` call that started the instance.
     */
    abstract dialogBegin(dc: DialogContext, dialogArgs?: any): Promise<DialogTurnResult<R>>;
    /**
     * (Optional) method called when an instance of the dialog is the active dialog and the user
     * replies with a new activity. The dialog will generally continue to receive the users replies
     * until it calls `DialogContext.end()`, `DialogContext.begin()`, or `DialogContext.prompt()`.
     *
     * If this method is NOT implemented then the dialog will be automatically ended when the user
     * replies.
     * @param dc The dialog context for the current turn of conversation.
     */
    dialogContinue?(dc: DialogContext): Promise<DialogTurnResult<R>>;
    /**
     * (Optional) method called when an instance of the dialog is being returned to from another
     * dialog that was started by the current instance using `DialogContext.begin()` or
     * `DialogContext.prompt()`.
     *
     * If this method is NOT implemented then the dialog will be automatically ended with a call
     * to `DialogContext.end()`. Any result passed from the called dialog will be passed to the
     * active dialogs parent.
     * @param dc The dialog context for the current turn of conversation.
     * @param result (Optional) value returned from the dialog that was called. The type of the value returned is dependant on the dialog that was called.
     */
    dialogResume?(dc: DialogContext, result?: any): Promise<DialogTurnResult<R>>;
    /**
     * (Optional) method called when the dialog has been requested to re-prompt the user for input.
     * @param dc The dialog context for the current turn of conversation.
     */
    dialogReprompt?(dc: DialogContext): Promise<DialogTurnResult<R>>;
    /**
     * (Optional) method called when the dialog is being cancelled through a call to `dc.cancel()`.
     * @param dc The dialog context for the current turn of conversation.
     */
    dialogCancel?(dc: DialogContext): Promise<DialogTurnResult<R>>;
}
