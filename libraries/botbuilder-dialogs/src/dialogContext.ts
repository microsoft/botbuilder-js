/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, TurnContext } from 'botbuilder-core';
import { Choice } from './choices';
import { Dialog, DialogInstance, DialogReason, DialogTurnResult, DialogTurnStatus, DialogEvent } from './dialog';
import { DialogSet } from './dialogSet';
import { PromptOptions } from './prompts';
import { DialogStateManager } from './memory';
import { DialogContainer } from './dialogContainer';
import { DialogEvents } from './dialogEvents';

/**
 * @private
 */
const ACTIVITY_RECEIVED_EMITTED = Symbol('ActivityReceivedEmitted');

/**
 * Contains dialog state, information about the state of the dialog stack, for a specific [DialogSet](xref:botbuilder-dialogs.DialogSet).
 * 
 * @remarks
 * State is read from and saved to storage each turn, and state cache for the turn is managed through
 * the [TurnContext](xref:botbuilder-core.TurnContext).
 * 
 * For more information, see the articles on
 * [Managing state](https://docs.microsoft.com/azure/bot-service/bot-builder-concept-state) and
 * [Dialogs library](https://docs.microsoft.com/azure/bot-service/bot-builder-concept-dialog).
 */
export interface DialogState {
    /**
     * Contains state information for each [Dialog](xref:botbuilder-dialogs.Dialog) on the stack.
     */
    dialogStack: DialogInstance[];
}

/**
 * The context for the current dialog turn with respect to a specific [DialogSet](xref:botbuilder-dialogs.DialogSet).
 *
 * @remarks
 * This includes the turn context, information about the dialog set, and the state of the dialog stack.
 * 
 * Use a dialog set's [createContext](xref:botbuilder-dialogs.DialogSet.createContext) method to create the dialog context.
 * Use the methods of the dialog context to manage the progression of dialogs in the set.
 *
 * For example:
 * ```JavaScript
 * const dc = await dialogs.createContext(turnContext);
 * const result = await dc.continueDialog();
 * ```
 */
export class DialogContext {
    /**
     * Gets the dialogs that can be called directly from this context.
     */
    public readonly dialogs: DialogSet;

    /**
     * Gets the context object for the turn.
     */
    public readonly context: TurnContext;

    /**
     * Gets the current dialog stack.
     */
    public readonly stack: DialogInstance[];

    public readonly state: DialogStateManager;

    /**
     * The parent dialog context for this dialog context, or `undefined` if this context doesn't have a parent.
     * 
     * @remarks
     * When it attempts to start a dialog, the dialog context searches for the [Dialog.id](xref:botbuilder-dialogs.Dialog.id)
     * in its [dialogs](xref:botbuilder-dialogs.DialogContext.dialogs). If the dialog to start is not found
     * in this dialog context, it searches in its parent dialog context, and so on.
     */
    public parent: DialogContext|undefined;

    /**
      * Creates an new instance of the [DialogContext](xref:botbuilder-dialogs.DialogContext) class.
      * 
      * @param dialogs The dialog set for which to create the dialog context.
      * @param context The context object for the current turn of the bot.
      * @param state The state object to use to read and write dialog state to storage.
      */
    constructor(dialogs: DialogSet, context: TurnContext, state: DialogState) {
        if (!Array.isArray(state.dialogStack)) { state.dialogStack = []; }
        this.dialogs = dialogs;
        this.context = context;
        this.stack = state.dialogStack;
        this.state = new DialogStateManager(this);
    }

    /**
     * Returns the state information for the dialog on the top of the dialog stack, or `undefined` if
     * the stack is empty.
     */
    public get activeDialog(): DialogInstance|undefined {
        return this.stack.length > 0 ? this.stack[this.stack.length - 1] : undefined;
    }

    /**
     * Returns dialog context for child if the active dialog is a container.
     */
    public get child(): DialogContext|undefined {
        var instance = this.activeDialog;
        if (instance != undefined) {
            // Is active dialog a container?
            const dialog = this.findDialog(instance.id);
            if (dialog instanceof DialogContainer) {
                return dialog.createChildContext(this);
            }
        }

        return undefined;
    }

    /**
     * Starts a dialog instance and pushes it onto the dialog stack.
     * Creates a new instance of the dialog and pushes it onto the stack.
     *
     * @param dialogId ID of the dialog to start.
     * @param options Optional. Arguments to pass into the dialog when it starts.
     * 
     * @remarks
     * If there's already an active dialog on the stack, that dialog will be paused until
     * it is again the top dialog on the stack.
     *
     * The [status](xref:botbuilder-dialogs.DialogTurnResult.status) of returned object describes
     * the status of the dialog stack after this method completes.
     *
     * This method throws an exception if the requested dialog can't be found in this dialog context
     * or any of its ancestors.
     * 
     * For example:
     * ```JavaScript
     * const result = await dc.beginDialog('greeting', { name: user.name });
     * ```
     * 
     * **See also**
     * - [endDialog](xref:botbuilder-dialogs.DialogContext.endDialog)
     * - [prompt](xref:botbuilder-dialogs.DialogContext.prompt)
     * - [replaceDialog](xref:botbuilder-dialogs.DialogContext.replaceDialog)
     * - [Dialog.beginDialog](xref:botbuilder-dialogs.Dialog.beginDialog)
     */
    public async beginDialog(dialogId: string, options?: object): Promise<DialogTurnResult> {
        // Lookup dialog
        const dialog: Dialog<{}> = this.findDialog(dialogId);
        if (!dialog) { throw new Error(`DialogContext.beginDialog(): A dialog with an id of '${ dialogId }' wasn't found.`); }

        // Push new instance onto stack.
        const instance: DialogInstance<any> = {
            id: dialogId,
            state: {}
        };
        this.stack.push(instance);

        // Call dialogs begin() method.
        return await dialog.beginDialog(this, options);
    }

    /**
     * Cancels all dialogs on the dialog stack, and clears stack.
     * 
     * @param cancelParents Optional. If `true` all parent dialogs will be cancelled as well.
     * @param eventName Optional. Name of a custom event to raise as dialogs are cancelled. This defaults to [cancelDialog](xref:botbuilder-dialogs.DialogEvents.cancelDialog). 
     * @param eventValue Optional. Value to pass along with custom cancellation event.
     *
     * @remarks
     * This calls each dialog's [Dialog.endDialog](xref:botbuilder-dialogs.Dialog.endDialog) method before
     * removing the dialog from the stack.
     * 
     * If there were any dialogs on the stack initially, the [status](xref:botbuilder-dialogs.DialogTurnResult.status)
     * of the return value is [cancelled](xref:botbuilder-dialogs.DialogTurnStatus.cancelled); otherwise, it's
     * [empty](xref:botbuilder-dialogs.DialogTurnStatus.empty).
     *
     * This example clears a dialog stack, `dc`, before starting a 'bookFlight' dialog.
     * ```JavaScript
     * await dc.cancelAllDialogs();
     * return await dc.beginDialog('bookFlight');
     * ```
     *
     * **See also**
     * - [endDialog](xref:botbuilder-dialogs.DialogContext.endDialog)
     */
    public async cancelAllDialogs(cancelParents = false, eventName?: string, eventValue?: any): Promise<DialogTurnResult> {
        eventName = eventName || DialogEvents.cancelDialog;
        if (this.stack.length > 0 || this.parent != undefined) {
            // Cancel all local and parent dialogs while checking for interception
            let notify = false;
            let dc: DialogContext = this;
            while (dc != undefined) {
                if (dc.stack.length > 0) {
                    // Check to see if the dialog wants to handle the event
                    // - We skip notifying the first dialog which actually called cancelAllDialogs() 
                    if (notify) {
                        const handled = await dc.emitEvent(eventName, eventValue, false, false);
                        if (handled) {
                            break;
                        }
                    }

                    // End the active dialog
                    await dc.endActiveDialog(DialogReason.cancelCalled);
                } else {
                    dc = cancelParents ? dc.parent : undefined;
                }

                notify = true;
            }

            return { status: DialogTurnStatus.cancelled };
        } else {
            return { status: DialogTurnStatus.empty };
        }
    }

    /**
     * Searches for a dialog with a given ID.
     * 
     * @param dialogId ID of the dialog to search for.
     * 
     * @remarks
     * If the dialog to start is not found in the [DialogSet](xref:botbuilder-dialogs.DialogSet) associated
     * with this dialog context, it attempts to find the dialog in its parent dialog context.
     * 
     * **See also**
     * - [dialogs](xref:botbuilder-dialogs.DialogContext.dialogs)
     * - [parent](xref:botbuilder-dialogs.DialogContext.parent)
     */
    public findDialog(dialogId: string): Dialog|undefined {
        let dialog = this.dialogs.find(dialogId);
        if (!dialog && this.parent) {
            dialog = this.parent.findDialog(dialogId);
        }
        return dialog;
    }

    /**
     * Helper function to simplify formatting the options for calling a prompt dialog.
     * 
     * @param dialogId ID of the prompt dialog to start.
     * @param promptOrOptions The text of the initial prompt to send the user,
     *      the activity to send as the initial prompt, or
     *      the object with which to format the prompt dialog.
     * @param choices Optional. Array of choices for the user to choose from,
     *      for use with a [ChoicePrompt](xref:botbuilder-dialogs.ChoicePrompt).
     * 
     * @remarks
     * This helper method formats the object to use as the `options` parameter, and then calls
     * [beginDialog](xref:botbuilder-dialogs.DialogContext.beginDialog) to start the specified prompt dialog.
     *
     * ```JavaScript
     * return await dc.prompt('confirmPrompt', `Are you sure you'd like to quit?`);
     * ```
     */
    public async prompt(dialogId: string, promptOrOptions: string | Partial<Activity> | PromptOptions): Promise<DialogTurnResult>;
    public async prompt(dialogId: string, promptOrOptions: string | Partial<Activity> | PromptOptions, choices: (string | Choice)[]): Promise<DialogTurnResult>;
    public async prompt(
        dialogId: string,
        promptOrOptions: string | Partial<Activity>,
        choices?: (string | Choice)[]
    ): Promise<DialogTurnResult> {
        let options: PromptOptions;
        if (
            (typeof promptOrOptions === 'object' &&
                (promptOrOptions as Activity).type !== undefined) ||
            typeof promptOrOptions === 'string'
        ) {
            options = { prompt: promptOrOptions as string | Partial<Activity> };
        } else {
            options = { ...promptOrOptions as PromptOptions };
        }

        if (choices) 
        {
            options.choices = choices;
        }
        
        return this.beginDialog(dialogId, options);
    }

    /**
     * Continues execution of the active dialog, if there is one, by passing this dialog context to its
     * [Dialog.continueDialog](xref:botbuilder-dialogs.Dialog.continueDialog) method.
     *
     * @remarks
     * After the call completes, you can check the turn context's [responded](xref:botbuilder-core.TurnContext.responded)
     * property to determine if the dialog sent a reply to the user.
     *
     * The [status](xref:botbuilder-dialogs.DialogTurnResult.status) of returned object describes
     * the status of the dialog stack after this method completes.
     *
     * Typically, you would call this from within your bot's turn handler.
     * 
     * For example:
     * ```JavaScript
     * const result = await dc.continueDialog();
     * if (result.status == DialogTurnStatus.empty && dc.context.activity.type == ActivityTypes.message) {
     *     // Send fallback message
     *     await dc.context.sendActivity(`I'm sorry. I didn't understand.`);
     * }
     * ```
     */
    public async continueDialog(): Promise<DialogTurnResult> {
        // if we are continuing and haven't emitted the activityReceived event, emit it
        // NOTE: This is backward compatible way for activity received to be fired even if you have legacy dialog loop
        if (!this.context.turnState.has(ACTIVITY_RECEIVED_EMITTED)) {
            this.context.turnState.set(ACTIVITY_RECEIVED_EMITTED, true);

            // Dispatch "activityReceived" event
            // - This fired from teh leaf and will queue up any interruptions.
            await this.emitEvent(DialogEvents.activityReceived, this.context.activity, true, true);
        }

        // Check for a dialog on the stack
        const instance: DialogInstance<any> = this.activeDialog;
        if (instance) {
            // Lookup dialog
            const dialog: Dialog<{}> = this.findDialog(instance.id);
            if (!dialog) {
                throw new Error(`DialogContext.continueDialog(): Can't continue dialog. A dialog with an id of '${ instance.id }' wasn't found.`);
            }

            // Continue execution of dialog
            return await dialog.continueDialog(this);
        } else {
            return { status: DialogTurnStatus.empty };
        }
    }

    /**
     * Ends a dialog and pops it off the stack. Returns an optional result to the dialog's parent.
     *
     * @param result Optional. A result to pass to the parent logic. This might be the next dialog
     *      on the stack, or it might be the bot's turn handler, if this was the last dialog on the stack.
     * 
     * @remarks
     * The _parent_ dialog is the next dialog on the dialog stack, if there is one. This method
     * calls the parent's [Dialog.resumeDialog](xref:botbuilder-dialogs.Dialog.resumeDialog) method,
     * passing the result returned by the ending dialog. If there is no parent dialog, the turn ends
     * and the result is available to the bot through the returned object's
     * [result](xref:botbuilder-dialogs.DialogTurnResult.result) property.
     *
     * The [status](xref:botbuilder-dialogs.DialogTurnResult.status) of returned object describes
     * the status of the dialog stack after this method completes.
     * 
     * Typically, you would call this from within the logic for a specific dialog to signal back to
     * the dialog context that the dialog has completed, the dialog should be removed from the stack,
     * and the parent dialog should resume.
     * 
     * For example:
     * ```JavaScript
     * return await dc.endDialog(returnValue);
     * ```
     * 
     * **See also**
     * - [beginDialog](xref:botbuilder-dialogs.DialogContext.beginDialog)
     * - [replaceDialog](xref:botbuilder-dialogs.DialogContext.replaceDialog)
     * - [Dialog.endDialog](xref:botbuilder-dialogs.Dialog.endDialog)
     */
    public async endDialog(result?: any): Promise<DialogTurnResult> {
        // End the active dialog
        await this.endActiveDialog(DialogReason.endCalled);

        // Resume parent dialog
        const instance: DialogInstance<any> = this.activeDialog;
        if (instance) {
            // Lookup dialog
            const dialog: Dialog<{}> = this.findDialog(instance.id);
            if (!dialog) {
                throw new Error(`DialogContext.endDialog(): Can't resume previous dialog. A dialog with an id of '${ instance.id }' wasn't found.`);
            }

            // Return result to previous dialog
            return await dialog.resumeDialog(this, DialogReason.endCalled, result);
        } else {
            // Signal completion
            return { status: DialogTurnStatus.complete, result: result };
        }
    }

    /**
     * Ends the active dialog and starts a new dialog in its place.
     *
     * @param dialogId ID of the dialog to start.
     * @param options Optional. Arguments to pass into the new dialog when it starts.
     * 
     * @remarks
     * This is particularly useful for creating a loop or redirecting to another dialog.
     *
     * The [status](xref:botbuilder-dialogs.DialogTurnResult.status) of returned object describes
     * the status of the dialog stack after this method completes.
     * 
     * This method is similar to ending the current dialog and immediately beginning the new one.
     * However, the parent dialog is neither resumed nor otherwise notified.
     *
     * **See also**
     * - [beginDialog](xref:botbuilder-dialogs.DialogContext.beginDialog)
     * - [endDialog](xref:botbuilder-dialogs.DialogContext.endDialog)
     */
    public async replaceDialog(dialogId: string, options?: object): Promise<DialogTurnResult> {
        // End the active dialog
        await this.endActiveDialog(DialogReason.replaceCalled);

        // Start replacement dialog
        return await this.beginDialog(dialogId, options);
    }

    /**
     * Requests the active dialog to re-prompt the user for input.
     *
     * @remarks
     * This calls the active dialog's [repromptDialog](xref:botbuilder-dialogs.Dialog.repromptDialog) method.
     *
     * For example:
     * ```JavaScript
     * await dc.repromptDialog();
     * ```
     */
    public async repromptDialog(): Promise<void> {
        // Try raising event first
        const handled = await this.emitEvent(DialogEvents.repromptDialog, undefined, false, false);
        if (!handled) {
            // Check for a dialog on the stack
            const instance: DialogInstance<any> = this.activeDialog;
            if (instance) {
                // Lookup dialog
                const dialog: Dialog<{}> = this.findDialog(instance.id);
                if (!dialog) {
                    throw new Error(`DialogSet.reprompt(): Can't find A dialog with an id of '${ instance.id }'.`);
                }

                // Ask dialog to re-prompt if supported
                await dialog.repromptDialog(this.context, instance);
            }
        }
    }

        /// <summary>
    /// Searches for a dialog with a given ID.
    /// Emits a named event for the current dialog, or someone who started it, to handle.
    /// </summary>
    /// <param name="name">Name of the event to raise.</param>
    /// <param name="value">Value to send along with the event.</param>
    /// <param name="bubble">Flag to control whether the event should be bubbled to its parent if not handled locally. Defaults to a value of `true`.</param>
    /// <param name="fromLeaf">Whether the event is emitted from a leaf node.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>True if the event was handled.</returns>
    public async emitEvent(name: string, value?: any, bubble = true, fromLeaf = false): Promise<boolean> {
        // Initialize event
        const dialogEvent: DialogEvent = {
            bubble: bubble,
            name: name,
            value: value,
        };

        // Find starting dialog
        let dc: DialogContext = this;
        if (fromLeaf) {
            while (true) {
                const childDc = dc.child;
                if (childDc != undefined) {
                    dc = childDc;
                } else {
                    break;
                }
            }
        }

        // Dispatch to active dialog first
        // - The active dialog will decide if it should bubble the event to its parent.
        const instance = dc.activeDialog;
        if (instance != undefined) {
            const dialog = dc.findDialog(instance.id);
            if (dialog != undefined) {
                return await dialog.onDialogEvent(dc, dialogEvent);
            }
        }

        return false;
    }

    private async endActiveDialog(reason: DialogReason): Promise<void> {
        const instance: DialogInstance<any> = this.activeDialog;
        if (instance) {
            // Lookup dialog
            const dialog: Dialog<{}> = this.findDialog(instance.id);
            if (dialog) {
                // Notify dialog of end
                await dialog.endDialog(this.context, instance, reason);
            }

            // Pop dialog off stack
            this.stack.pop();
        }
    }
}
