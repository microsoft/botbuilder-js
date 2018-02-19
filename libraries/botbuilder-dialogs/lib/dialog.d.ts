/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Promiseable } from 'botbuilder';
import { DialogSet } from './dialogSet';
/**
 * Interface of Dialog objects that can be added to a `DialogSet`. The dialog should generally
 * be a singleton and added to a dialog set using `DialogSet.add()` at which point it will be
 * assigned a unique ID.
 */
export interface Dialog {
    /**
     * Method called when a new dialog has been pushed onto the stack and is being activated.
     * @param context The dialog context for the current turn of conversation.
     * @param dialogs The dialogs parent set.
     * @param args (Optional) arguments that were passed to the dialog during `begin()` call that started the instance.
     */
    begin(context: BotContext, dialogs: DialogSet, args?: any): Promiseable<void>;
    /**
     * (Optional) method called when an instance of the dialog is the "current" dialog and the
     * user replies with a new activity. The dialog will generally continue to receive the users
     * replies until it calls either `DialogSet.end()` or `DialogSet.begin()`.
     *
     * If this method is NOT implemented then the dialog will automatically be ended when the user
     * replies.
     * @param context The dialog context for the current turn of conversation.
     * @param dialogs The dialogs parent set.
     */
    continue?(context: BotContext, dialogs: DialogSet): Promiseable<void>;
    /**
     * (Optional) method called when an instance of the dialog is being returned to from another
     * dialog that was started by the current instance using `DialogSet.begin()`.
     *
     * If this method is NOT implemented then the dialog will be automatically ended with a call
     * to `DialogSet.endDialogWithResult()`. Any result passed from the called dialog will be passed
     * to the current dialogs parent.
     * @param context The dialog context for the current turn of conversation.
     * @param dialogs The dialogs parent set.
     * @param result (Optional) value returned from the dialog that was called. The type of the value returned is dependant on the dialog that was called.
     */
    resume?(context: BotContext, dialogs: DialogSet, result?: any): Promiseable<void>;
}
/**
 * Tracking information for a dialog on the stack.
 */
export interface DialogInstance<T extends Object> {
    /** ID of the dialog this instance is for. */
    id: string;
    /** The instances persisted state. */
    state: T;
}
