/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, TurnContext } from 'botbuilder-core';
import { Choice } from './choices';
import { Dialog, DialogInstance, DialogReason, DialogTurnResult, DialogTurnStatus, DialogEvent } from './dialog';
import { DialogSet } from './dialogSet';
import { PromptOptions } from './prompts';
import { StateMap } from './stateMap';
import { DialogContextState } from './dialogContextState';
import { DialogCommand } from './dialogCommand';
import { DialogContainer } from './dialogContainer';

/**
 * State information persisted by a `DialogSet`.
 */
export interface DialogState {
    /**
     * The dialog stack being persisted.
     */
    dialogStack: DialogInstance[];

    /**
     * (optional) values that are persisted for the lifetime of the conversation.
     *
     * @remarks
     * These values are intended to be transient and may automatically expire after some timeout
     * period.
     */
    conversationState?: object;

    /**
     * (Optional) values that are persisted across all interactions with the current user.
     */
    userState?: object;
}

/**
 * A context object used to start and stop dialogs within a `DialogContainer`.
 *
 * @remarks
 * Every active DialogContainer instance has its own DialogContext which can be used to start and
 * stop dialogs within that container.  The [parent](#parent) and [child](#child) properties can
 * be used to navigate the bots stack of active dialog containers.
 */
export class DialogContext {
    /**
     * Set of dialogs that can be called from this dialog context.
     */
    public readonly dialogs: DialogSet;

    /**
     * Context for the current turn of conversation.
     */
    public readonly context: TurnContext;

    /**
     * Current dialog stack.
     */
    public readonly stack: DialogInstance[];

    /**
     * In-memory properties that are currently visible to the active dialog.
     */
    public readonly state: DialogContextState;

    /**
     * Creates a new DialogContext instance.
     * @param dialogs Parent dialog set.
     * @param context Context for the current turn of conversation with the user.
     * @param state State object being used to persist the dialog stack.
     * @param userState (Optional) user values to bind context to. If not specified, a new set of user values will be persisted off the passed in `state` property.
     * @param conversationState (Optional) conversation values to bind context to. If not specified, a new set of conversation values will be persisted off the passed in `state` property.
     */
    constructor(dialogs: DialogSet, context: TurnContext, state: DialogState, userState?: StateMap, conversationState?: StateMap) {
        if (!Array.isArray(state.dialogStack)) { state.dialogStack = []; }
        this.dialogs = dialogs;
        this.context = context;
        this.stack = state.dialogStack;
        if (!conversationState) {
            // Create a new session state map
            if (typeof state.conversationState !== 'object') { state.conversationState = {}; }
            conversationState = new StateMap(state.conversationState);
        }
        if (!userState) {
            // Create a new session state map
            if (typeof state.userState !== 'object') { state.userState = {}; }
            userState = new StateMap(state.userState);
        }
        this.state = new DialogContextState(this, userState, conversationState);
    }

    /**
     * Returns the persisted instance of the active dialog on the top of the stack or `undefined` if
     * the stack is empty.
     *
     * @remarks
     * Dialogs can use this to persist custom state in between conversation turns:
     */
    public get activeDialog(): DialogInstance|undefined {
        let instance: DialogInstance;
        if (this.stack.length > 0) {
            // For DialogCommand instances we need to return the inherited state.
            const frame = this.stack[this.stack.length - 1];
            instance = {
                id: frame.id,
                state: this.getActiveDialogState(this, frame.state)
            };
        }
        return instance;
    }

    /**
     * A DialogContext for manipulating the stack of current containers parent.
     *
     * @remarks
     * Returns `undefined` if the current container is the [rootParent](#rootparent).
     */
    public parent: DialogContext|undefined;

    /**
     * A DialogContext for manipulating the stack of a child container.
     *
     * @remarks
     * Returns `undefined` if the [activeDialog](#activedialog) isn't an instance of a
     * DialogContainer or the container has no active child dialogs.
     */
    public get child(): DialogContext|undefined {
        const instance = this.activeDialog;
        if (instance) {
            const dialog = this.findDialog(instance.id);
            if (dialog instanceof DialogContainer) {
                return (dialog as DialogContainer).createChildContext(this);
            }
        }

        return undefined;
    }

    /**
     * Pushes a new dialog onto the dialog stack.
     *
     * @remarks
     * If there's already an active dialog on the stack, that dialog will be paused until the new
     * dialog calls [endDialog()](#enddialog).
     *
     * ```JavaScript
     * return await dc.beginDialog('greeting', { name: user.name });
     * ```
     *
     * The `DialogTurnResult.status` returned can be:
     * - `DialogTurnStatus.active` if the dialog started was a multi-turn dialog.
     * - `DialogTurnStatus.completed` if the dialog started was a single-turn dialog.
     * @param dialogId ID of the dialog to start.
     * @param options (Optional) additional argument(s) to pass to the dialog being started.
     */
    public async beginDialog(dialogId: string, options?: object): Promise<DialogTurnResult> {
        // Lookup dialog
        const dialog: Dialog<{}> = this.findDialog(dialogId);
        if (!dialog) { throw new Error(`DialogContext.beginDialog(): A dialog with an id of '${ dialogId }' wasn't found.`); }

        // Process dialogs input bindings
        // - If the stack is empty, any `dialog.` bindings will be pulled from the active dialog on
        //   the parents stack.
        options = options || {};
        for(const option in dialog.inputProperties) {
            if (dialog.inputProperties.hasOwnProperty(option)) {
                const binding = dialog.inputProperties[option];
                if (binding) {
                    const value = this.state.getValue(binding);
                    options[option] = Array.isArray(value) || typeof value === 'object' ? JSON.parse(JSON.stringify(value)) : value;
                }
            }
        }

        // Check for inherited state
        // - Local stack references are positive numbers and negative numbers are references on the
        //   parents stack.
        let state: number|object;
        if (dialog.inheritState) {
            if (this.stack.length > 0) {
                state = this.stack.length - 1;
            } else if (this.parent) {
                // We can't use -0 so index 0 in the parents stack is encoded as -1.
                state = 0 - this.parent.stack.length;
            }
            // Find stack entry to inherit
            for (let i = this.stack.length - 1; i >= 0; i--) {
                if (typeof this.stack[i] === 'object') {
                    state = i;
                    break;
                }
            }
        }
        if (state == undefined) { state = {} }

        // Push new instance onto stack.
        const instance: DialogInstance = {
            id: dialogId,
            state: state
        };
        this.stack.push(instance);

        // Call dialogs begin() method.
        return await dialog.beginDialog(this, options);
    }

    /**
     * Cancels any dialogs on the stack resulting in an empty stack.
     * @param eventName (Optional) name of event to bubble up as dialogs are cancelled. Defaults to `cancelDialog`.
     * @param eventValue (Optional) value to pass with event.
     */
    public async cancelAllDialogs(eventName = 'cancelDialog', eventValue?: any): Promise<DialogTurnResult> {
        if (this.stack.length > 0 || this.parent) {
            // Cancel all local and parent dialogs while checking for interception
            let notify = false;
            let dc: DialogContext = this;
            while (dc) {
                if (dc.stack.length > 0)
                {
                    // Check to see if the dialog wants to handle the event
                    if (notify && await dc.emitEvent(eventName, eventValue, false)) {
                        // Event handled so stop canceling dialogs
                        break;
                    }

                    // End the active dialog
                    await dc.endActiveDialog(DialogReason.cancelCalled);
                } else {
                    dc = dc.parent;
                }
                notify = true;
            }

            return { status: DialogTurnStatus.cancelled };
        } else {
            // Stack was empty and no parent
            return { status: DialogTurnStatus.empty };
        }
    }

    /**
     * Emits a named event for the current dialog, or someone who started it, to handle.
     * @param name Name of the event to raise.
     * @param value (Optional) value to send along with the event.
     * @param bubble (Optional) flag to control whether the event should be bubbled to its parent if not handled locally. Defaults to a value of `true`.
     * @param fromLeaf (Optional) if `true` the event will be emitted starting with the leaf most child dialog. Defaults to a value of `false`.
     */
    public async emitEvent(name: string, value?: any, bubble = true, fromLeaf = false): Promise<boolean> {
        // Initialize event
        const event: DialogEvent = {
            bubble: bubble,
            name: name,
            value: value
        };

        // Find starting dialog
        let dc: DialogContext = this;
        if (fromLeaf) {
            while (true) {
                const childDC = dc.child;
                if (childDC) {
                    dc = childDC;
                } else {
                    break;
                }
            }
        }

        // Dispatch to active dialog
        // - The dialog is responsible for bubbling the event to its parent
        const instance = dc.activeDialog;
        if (instance) {
            const dialog = dc.findDialog(instance.id);
            if (dialog) {
                return await dialog.onDialogEvent(dc, event);
            }
        }

        return false;
    }

    /**
     * Searches for a dialog to begin or replace.
     *
     * @remarks
     * If the dialog cannot be found within the current `DialogSet`, the parent `DialogContext`
     * will be searched as well.
     * @param dialogId ID of the dialog to search for.
     */
    public findDialog(dialogId: string): Dialog|undefined {
        let dialog = this.dialogs.find(dialogId);
        if (!dialog && this.parent) {
            dialog = this.parent.findDialog(dialogId);
        }
        return dialog;
    }

    /**
     * Helper function to simplify formatting the options for calling a `Prompt` based dialog.
     *
     * @remarks
     * This is a lightweight wrapper abound [beginDialog()](#begindialog). It fills in a
     * `PromptOptions` structure and then passes it through to `dc.beginDialog(dialogId, options)`.
     *
     * ```JavaScript
     * return await dc.prompt('confirmPrompt', `Are you sure you'd like to quit?`);
     * ```
     * @param dialogId ID of the prompt to start.
     * @param promptOrOptions Initial prompt to send the user or a set of options to configure the prompt with.
     * @param choices (Optional) array of choices associated with the prompt.
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
     * Continues execution of the active multi-turn dialog, if there is one.
     *
     * @remarks
     * The stack will be inspected and the active dialog will be retrieved using `DialogSet.find()`.
     * The dialog will then have its `Dialog.continueDialog()` method called.
     *
     * ```JavaScript
     * const result = await dc.continueDialog();
     * if (result.status == DialogTurnStatus.empty && dc.context.activity.type == ActivityTypes.message) {
     *     // Send fallback message
     *     await dc.context.sendActivity(`I'm sorry. I didn't understand.`);
     * }
     * ```
     *
     * The `DialogTurnResult.status` returned can be:
     * - `DialogTurnStatus.active` if there's still one or more dialogs on the stack.
     * - `DialogTurnStatus.completed` if the last dialog on the stack just ended.
     * - `DialogTurnStatus.empty` if the stack was empty.
     */
    public async continueDialog(): Promise<DialogTurnResult> {
        // Check for a dialog on the stack
        const instance: DialogInstance = this.activeDialog;
        if (instance) {
            // Lookup dialog
            const dialog: Dialog<{}> = this.findDialog(instance.id);
            if (!dialog) {
                throw new Error(`DialogContext.continue(): Can't continue dialog. A dialog with an id of '${ instance.id }' wasn't found.`);
            }

            // Continue execution of dialog
            return await dialog.continueDialog(this);
        } else {
            return { status: DialogTurnStatus.empty };
        }
    }

    /**
     * Ends a dialog by popping it off the stack and returns an optional result to the dialogs
     * parent.
     *
     * @remarks
     * The parent dialog is the dialog the started the one being ended via a call to either
     * [beginDialog()](#begindialog) or [prompt()](#prompt). The parent dialog will have its
     * `Dialog.resumeDialog()` method called with any returned `result`. If there is no parent
     * dialog then turn will end and the result will be passed to the bot via
     * `DialogTurnResult.result`.
     *
     * ```JavaScript
     * return await dc.endDialog();
     * ```
     *
     * The `DialogTurnResult.status` returned can be:
     * - `DialogTurnStatus.active` the parent dialog was resumed and is still active.
     * - `DialogTurnStatus.completed` the parent dialog completed or there was no parent dialog to resume.
     * @param result (Optional) result to pass to the parent dialogs `Dialog.resume()` method.
     */
    public async endDialog(result?: any): Promise<DialogTurnResult> {
        // End the active dialog
        await this.endActiveDialog(DialogReason.endCalled, result);

        // Resume parent dialog
        const instance: DialogInstance = this.activeDialog;
        if (instance) {
            // Lookup dialog
            const dialog: Dialog<{}> = this.findDialog(instance.id);
            if (!dialog) {
                throw new Error(`DialogContext.endDialog(): Can't resume previous dialog. A dialog with an id of '${instance.id}' wasn't found.`);
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
     * @remarks
     * This method is conceptually equivalent to calling [endDialog()](#enddialog) and then
     * immediately calling [beginDialog()](#begindialog). The difference is that the parent
     * dialog is not resumed or otherwise notified that the dialog it started has been replaced.
     *
     * This method is particularly useful for creating conversational loops within your bot:
     *
     * ```JavaScript
     * this.addDialog(new WaterfallDialog('randomNumber', [
     *     async (action) => {
     *         const { min, max } = action.options;
     *         const num = min + Math.floor((max - min) * Math.random());
     *         return await action.prompt('continuePrompt', `Here's a number between ${min} and ${max}: ${num}. Should I pick another one?`);
     *     },
     *     async (action) {
     *         if (action.result) {
     *             return await action.replaceDialog(this.id, action.options);
     *         } else {
     *             return await action.endDialog();
     *         }
     *     }
     * ]));
     *
     * this.addDialog(new ConfirmPrompt('continuePrompt'));
     * ```
     * @param dialogId ID of the new dialog to start.
     * @param options (Optional) additional argument(s) to pass to the new dialog.
     */
    public async replaceDialog(dialogId: string, options?: object): Promise<DialogTurnResult> {
        // End the active dialog
        await this.endActiveDialog(DialogReason.replaceCalled);

        // Start replacement dialog
        return await this.beginDialog(dialogId, options);
    }

    /**
     * Requests the [activeDialog](#activeDialog) to re-prompt the user for input.
     *
     * @remarks
     * The active dialogs `Dialog.repromptDialog()` method will be called.
     *
     * ```JavaScript
     * await dc.repromptDialog();
     * ```
     */
    public async repromptDialog(): Promise<void> {
        // Emit 'repromptDialog' event first
        const handled = await this.emitEvent('repromptDialog', undefined, false);
        if (!handled) {
            // Check for a dialog on the stack
            const instance: DialogInstance = this.activeDialog;
            if (instance) {
                // Lookup dialog
                const dialog: Dialog<{}> = this.findDialog(instance.id);
                if (!dialog) {
                    throw new Error(`DialogSet.reprompt(): Can't find A dialog with an id of '${instance.id}'.`);
                }

                // Ask dialog to re-prompt if supported
                await dialog.repromptDialog(this.context, instance);
            }
        }
    }

    private async endActiveDialog(reason: DialogReason, result?: any): Promise<void> {
        const instance: DialogInstance = this.activeDialog;
        if (instance) {
            // Lookup dialog
            const dialog: Dialog<{}> = this.findDialog(instance.id);
            if (dialog) {
                // Notify dialog of end
                await dialog.endDialog(this.context, instance, reason);
            }

            // Pop dialog off stack
            this.stack.pop();

            // Process dialogs output binding
            // - if the stack is empty, any `dialog.` bindings will be applied to the active dialog
            //   on the parents stack.
            if (dialog && dialog.outputProperty && result !== undefined) {
                this.state.setValue(dialog.outputProperty, result);
            }
        }
    }

    private getActiveDialogState(dc: DialogContext, state: object|number): object {
        if (typeof state === 'number') {
            // Positive values are indexes within the current DC and negative values are indexes in
            // the parent DC.
            if (state >= 0) {
                if (state < dc.stack.length) {
                    return this.getActiveDialogState(dc, dc.stack[state].state);
                } else {
                    throw new Error(`DialogContext.activeDialog: Can't find inherited state. Index out of range.`);
                }
            } else if (dc.parent) {
                // Parent stack index of 0 is encoded as -1 so we need to make positive and then subtract 1
                return this.getActiveDialogState(dc.parent, (0 - state) - 1);
            } else {
                throw new Error(`DialogContext.activeDialog: Can't find inherited state. No parent DialogContext.`);
            }
        } else {
            return state;
        }
    }
}
