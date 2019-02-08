/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, TurnContext } from 'botbuilder-core';
import { Choice } from './choices';
import { Dialog, DialogInstance, DialogReason, DialogTurnResult, DialogTurnStatus } from './dialog';
import { DialogSet } from './dialogSet';
import { PromptOptions } from './prompts';
import { StateMap } from './stateMap';
import { DialogContextState } from './dialogContextState';

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
 * A context object used to manipulate a dialog stack.
 *
 * @remarks
 * This is typically created through a call to `DialogSet.createContext()` and is then passed
 * through to all of the bots dialogs and waterfall steps.
 *
 * ```JavaScript
 * const dc = await dialogs.createContext(turnContext);
 * ```
 */
export class DialogContext {
    private _activeTags: string[]|undefined;

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
     * The parent DialogContext if any.
     * 
     * @remarks
     * This will be used when searching for dialogs to start.
     */
    public parent: DialogContext|undefined;

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
        return this.stack.length > 0 ? this.stack[this.stack.length - 1] : undefined;
    }

    /**
     * Returns a list of all `Dialog.tags` that are currently on the dialog stack.
     * 
     * @remarks
     * Any duplicate tags are removed from the returned list and the order of the tag reflects the
     * order of the dialogs on the stack. 
     * 
     * The returned list will also include any tags applied as "globalTags". These tags are 
     * retrieved by calling `context.turnState.get('globalTags')` and will therefore need to be
     * assigned for every turn of conversation using `context.turnState.set('globalTags', ['myTag'])`.
     */
    public get activeTags(): string[] {
        // Cache tags on first request
        if (this._activeTags == undefined) {
            // Get parent tags that are active
            if (this.parent) {
                this._activeTags = this.parent.activeTags;
            } else {
                this._activeTags = this.context.turnState.get('globalTags') || [];
            }

            // Add tags for current dialog stack
            const stack = this.stack;
            for (let i = 0; i < stack.length; i++) {
                const dialog = this.findDialog(stack[i].id);
                if (dialog && dialog.tags.length > 0) {
                    dialog.tags.forEach((tag) => {
                        if (this._activeTags.indexOf(tag) < 0) {
                            this._activeTags.push(tag);
                        }
                    });
                }
            }
        }

        return this._activeTags;
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
        if (!dialog) { throw new Error(`DialogContext.beginDialog(): A dialog with an id of '${dialogId}' wasn't found.`); }

        // Process dialogs input bindings
        options = options || {};
        for(const option in dialog.inputBindings) {
            if (dialog.inputBindings.hasOwnProperty(option)) {
                const binding = JSON.parse(JSON.stringify(dialog.inputBindings[option]));
                options[option] = this.state.getValue(binding);
            }
        }

        // Push new instance onto stack.
        const instance: DialogInstance = {
            id: dialogId,
            state: {}
        };
        this.stack.push(instance);
        this._activeTags = undefined;

        // Call dialogs begin() method.
        return await dialog.beginDialog(this, options);
    }

    /**
     * Cancels any dialogs on the stack resulting in an empty stack.
     *
     * @remarks
     * The dialogs being cancelled will have their `Dialog.endDialog()` method called before being
     * removed from the stack.
     *
     * ```JavaScript
     * await dc.cancelAllDialogs();
     * return await dc.beginDialog('bookFlight');
     * ```
     *
     * The `DialogTurnResult.status` returned can be:
     * - `DialogTurnStatus.cancelled` if one or more dialogs were cancelled.
     * - `DialogTurnStatus.empty` if the stack was empty.
     */
    public async cancelAllDialogs(): Promise<DialogTurnResult> {
        this._activeTags = undefined;
        if (this.stack.length > 0) {
            while (this.stack.length > 0) {
                await this.endActiveDialog(DialogReason.cancelCalled);
            }

            return { status: DialogTurnStatus.cancelled };
        } else {
            return { status: DialogTurnStatus.empty };
        }
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
            options = { prompt: promptOrOptions as string | Partial<Activity>, choices: choices };
        } else {
            options = { ...promptOrOptions as PromptOptions };
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
                throw new Error(`DialogContext.continue(): Can't continue dialog. A dialog with an id of '${instance.id}' wasn't found.`);
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
        this._activeTags = undefined;

        // Resume parent dialog
        const instance: DialogInstance = this.activeDialog;
        if (instance) {
            // Lookup dialog
            const dialog: Dialog<{}> = this.findDialog(instance.id);
            if (!dialog) {
                throw new Error(`DialogContext.end(): Can't resume previous dialog. A dialog with an id of '${instance.id}' wasn't found.`);
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
     *     async (step) => {
     *         const { min, max } = step.options;
     *         const num = min + Math.floor((max - min) * Math.random());
     *         return await step.prompt('continuePrompt', `Here's a number between ${min} and ${max}: ${num}. Should I pick another one?`);
     *     },
     *     async (step) {
     *         if (step.result) {
     *             return await step.replaceDialog(this.id, step.options);
     *         } else {
     *             return await step.endDialog();
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

    /**
     * Evaluates a selector expression to see if it matches the current set of active tags.
     * 
     * @remarks
     * The syntax for the selector is simply a do separated list of tags. So `profile.namePrompt` 
     * would return `true` if both the "profile" and "namePrompt" were found to exist in the
     * current list of [activeTags](#activetags).  
     * @param selector Selector expression to evaluate. 
     * @param additionalTags (Optional) additional list of tags that should be considered active.
     */
    public tagSelectorMatched(selector: string, additionalTags?: string[]): boolean {
        const selected = selector.split('.');
        const activeTags = this.activeTags;
        additionalTags = additionalTags || [];
        for (let i = 0; i < selected.length; i++) {
            const tag = selected[i];
            if (tag.length > 0 && activeTags.indexOf(tag) < 0 && additionalTags.indexOf(tag) < 0) {
                return false;
            }
        }
        return true;
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
            if (dialog && dialog.outputBinding && result !== undefined) {
                this.state.setValue(dialog.outputBinding, result);
            }
        }
    }
}
