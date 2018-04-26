/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, Promiseable } from 'botbuilder';
import { DialogContext, DialogResult } from './dialogContext';
/**
 * Tracking information for a dialog on the stack.
 * @param T (Optional) type of state being persisted for dialog.
 */
export interface DialogInstance<T extends any = any> {
    /** ID of the dialog this instance is for. */
    id: string;
    /** The instances persisted state. */
    state: T;
}
/**
 * :package: **botbuilder-dialogs**
 *
 * Base class for all dialogs.
 *
 * The `Control` and `CompositeControl` classes are very similar in that they both add `begin()`
 * and `continue()` methods which simplify consuming the control from a non-dialog based bot. The
 * primary difference between the two classes is that the `CompositeControl` class is designed to
 * bridge one `DialogSet` to another where the `Control` class assumes that the derived dialog can
 * be used in complete isolation without the need for any other supporting dialogs.
 * @param C The type of `TurnContext` being passed around. This simply lets the typing information for any context extensions flow through to dialogs and waterfall steps.
 * @param R (Optional) type of result that's expected to be returned by the control.
 * @param O (Optional) options that can be passed into the [begin()](#begin) method.
 */
export declare abstract class Dialog<C extends TurnContext, R = any, O = {}> {
    /**
     * Starts the control. Depending on the control, its possible for the control to finish
     * immediately so it's advised to check the result object returned by `begin()` and ensure that
     * the control is still active before continuing.
     *
     * **Usage Example:**
     *
     * ```JavaScript
     * const state = {};
     * const result = await control.begin(context, state);
     * if (!result.active) {
     *     const value = result.result;
     * }
     * ```
     * @param context Context for the current turn of the conversation with the user.
     * @param state A state object that the control will use to persist its current state. This should be an empty object which the control will populate. The bot should persist this with its other conversation state for as long as the control is still active.
     * @param options (Optional) additional options supported by the control.
     */
    begin(context: C, state: object, options?: O): Promise<DialogResult<R>>;
    /**
     * Passes a users reply to the control for further processing. The bot should keep calling
     * `continue()` for future turns until the control returns a result with `Active == false`.
     * To cancel or interrupt the prompt simply delete the `state` object being persisted.
     *
     * **Usage Example:**
     *
     * ```JavaScript
     * const result = await control.continue(context, state);
     * if (!result.active) {
     *     const value = result.result;
     * }
     * ```
     * @param context Context for the current turn of the conversation with the user.
     * @param state A state object that was previously initialized by a call to [begin()](#begin).
     */
    continue(context: C, state: object): Promise<DialogResult<R>>;
    /**
     * Method called when a new dialog has been pushed onto the stack and is being activated.
     * @param dc The dialog context for the current turn of conversation.
     * @param dialogArgs (Optional) arguments that were passed to the dialog during `begin()` call that started the instance.
     */
    abstract dialogBegin(dc: DialogContext<C>, dialogArgs?: any): Promiseable<any>;
    /**
     * (Optional) method called when an instance of the dialog is the "current" dialog and the
     * user replies with a new activity. The dialog will generally continue to receive the users
     * replies until it calls either `DialogSet.end()` or `DialogSet.begin()`.
     *
     * If this method is NOT implemented then the dialog will automatically be ended when the user
     * replies.
     * @param dc The dialog context for the current turn of conversation.
     */
    dialogContinue?(dc: DialogContext<C>): Promiseable<any>;
    /**
     * (Optional) method called when an instance of the dialog is being returned to from another
     * dialog that was started by the current instance using `DialogSet.begin()`.
     *
     * If this method is NOT implemented then the dialog will be automatically ended with a call
     * to `DialogSet.endDialogWithResult()`. Any result passed from the called dialog will be passed
     * to the current dialogs parent.
     * @param dc The dialog context for the current turn of conversation.
     * @param result (Optional) value returned from the dialog that was called. The type of the value returned is dependant on the dialog that was called.
     */
    dialogResume?(dc: DialogContext<C>, result?: any): Promiseable<any>;
}
