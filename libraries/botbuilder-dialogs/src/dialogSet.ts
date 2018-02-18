/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity } from 'botbuilder';
import { Dialog, DialogInstance } from './dialog';
import { Waterfall, WaterfallStep } from './waterfall';
import { PromptOptions, ChoicePromptOptions } from './prompts/index';
import { Choice } from 'botbuilder-choices';

/**
 * A related set of dialogs that can all call each other.
 */
export class DialogSet {
    private readonly stackName: string;
    private readonly dialogs: { [id:string]: Dialog; } = {};

    /**
     * Creates an empty dialog set.
     * @param stackName (Optional) name of the field to store the dialog stack in off the bots conversation state object. This defaults to 'dialogStack'.
     */
    constructor (stackName?: string) {
        this.stackName = stackName || 'dialogStack';
    }


    /**
     * Adds a new dialog to the set and returns the added dialog.
     * @param dialogId Unique ID of the dialog within the set.
     * @param dialogOrSteps Either a new dialog or an array of waterfall steps to execute. If waterfall steps are passed in they will automatically be passed into an new instance of a `Waterfall` class.
     */
    public add<T extends Dialog>(dialogId: string, dialogOrSteps: T): T;
    public add(dialogId: string, dialogOrSteps: WaterfallStep[]): Waterfall;
    public add(dialogId: string, dialogOrSteps: Dialog|WaterfallStep[]): Dialog {
        if (this.dialogs.hasOwnProperty(dialogId)) { throw new Error(`DialogSet.add(): A dialog with an id of '${dialogId}' already added.`) }
        return this.dialogs[dialogId] = Array.isArray(dialogOrSteps) ? new Waterfall(dialogOrSteps as any) : dialogOrSteps;
    }
    
    /**
     * Pushes a new dialog onto the dialog stack.
     * @param context Context object for the current turn of conversation with the user. This will get mapped into a `DialogContext` and passed to the dialog started.
     * @param dialogId ID of the dialog to start.
     * @param dialogArgs (Optional) additional argument(s) to pass to the dialog being started.
     */
    public begin(context: BotContext, dialogId: string, dialogArgs?: any): Promise<void> {
        try {
            // Lookup dialog
            const dialog = this.find(dialogId);
            if (!dialog) { throw new Error(`DialogSet.begin(): A dialog with an id of '${dialogId}' wasn't found.`) }
            
            // Push new instance onto stack. 
            const instance: DialogInstance<any> = {
                id: dialogId,
                state: {}
            };
            this.getStack(context).push(instance);
            
            // Call dialogs begin() method.
            return Promise.resolve(dialog.begin(context, this, dialogArgs));
        } catch(err) {
            return Promise.reject(err);
        }
    }

    /**
     * Helper function to simplify formatting the options for calling a prompt dialog.
     * @param context Context object for the current turn of conversation with the user. This will get mapped into a `DialogContext` and passed to the dialog started.
     * @param dialogId ID of the prompt to start.
     * @param prompt Initial prompt to send the user.
     * @param choices Array of choices to prompt the user for.
     * @param options (Optional) additional options to configure the prompt.
     */
    public prompt<O extends PromptOptions = PromptOptions>(context: BotContext, dialogId: string, prompt: string|Partial<Activity>, options?: O): Promise<void>;
    public prompt<O extends ChoicePromptOptions = ChoicePromptOptions>(context: BotContext, dialogId: string, prompt: string|Partial<Activity>, choices: (string|Choice)[], options?: O): Promise<void>;
    public prompt<O extends PromptOptions = PromptOptions>(context: BotContext, dialogId: string, prompt: string|Partial<Activity>, choices?: (string|Choice)[]|O, options?: O): Promise<void> {
        if (!Array.isArray(choices)) {
            options = choices;
            choices = undefined;
        }
        const args = Object.assign({}, options) as ChoicePromptOptions;
        if (prompt) { args.prompt = prompt }
        if (choices) { args.choices = choices }
        return this.begin(context, dialogId, args);
    }

    /**
     * Deletes any existing dialog stack, cancelling any dialogs on the stack.
     * @param context Context object for the current turn of conversation with the user.
     */
    public endAll(context: BotContext): this {
        // Cancel any current dialogs
        const state = getConversationState(context);
        state[this.stackName] = [];
        return this;
    }

    /**
     * Continues execution of the active dialog, if there is one, by passing the
     * context object to its `Dialog.continue()` method. 
     * @param context Context object for the current turn of conversation with the user. This will get mapped into a `DialogContext` and passed to the dialog started.
     */
    public continue(context: BotContext): Promise<void> {
        try {
            if (this.getStack(context).length > 0) {
                // Get current dialog instance
                const instance = this.getInstance(context);

                // Lookup dialog
                const dialog = this.find(instance.id);
                if (!dialog) { throw new Error(`DialogSet.continue(): Can't continue dialog. A dialog with an id of '${instance.id}' wasn't found.`) }
                
                // Check for existence of a continue() method
                if (dialog.continue) {
                    // Continue execution of dialog
                    return Promise.resolve(dialog.continue(context, this));
                } else {
                    // Just end the dialog
                    return this.end(context);
                }
            } else {
                return Promise.resolve();
            }
        } catch(err) {
            return Promise.reject(err);
        }
    }

    public end(context: BotContext, result?: any): Promise<void> {
        try {
            // Pop current dialog off the stack
            const stack = this.getStack(context);
            if (stack.length > 0) { stack.pop() }

            // Resume previous dialog
            if (stack.length > 0) {
                // Get dialog instance
                const instance = this.getInstance(context);

                // Lookup dialog
                const dialog = this.find(instance.id);
                if (!dialog) { throw new Error(`DialogSet.end(): Can't resume previous dialog. A dialog with an id of '${instance.id}' wasn't found.`) }
                
                // Check for existence of a resumeDialog() method
                if (dialog.resume) {
                    // Return result to previous dialog
                    return Promise.resolve(dialog.resume(context, this, result));
                } else {
                    // Just end the dialog
                    return this.end(context);
                }
            } else {
                return Promise.resolve();
            }
        } catch(err) {
            return Promise.reject(err);
        }
    }

    /**
     * Looks up to see if a dialog with the given ID has been registered with the set. If not an
     * attempt will be made to look up the dialog as a prompt. If the dialog still can't be found,
     * then `undefined` will be returned.
     * @param dialogId ID of the dialog/prompt to lookup.
     */
    public find(dialogId: string): Dialog|undefined {
        return this.dialogs.hasOwnProperty(dialogId) ? this.dialogs[dialogId] : undefined;
    }

    /**
     * Returns the dialog stack persisted for a conversation.  
     * @param context Context object for the current turn of conversation with the user.
     */
    public getStack<T extends Object = {}>(context: BotContext): DialogInstance<T>[] {
        const state = getConversationState(context);
        if (!Array.isArray(state[this.stackName])) { state[this.stackName] = [] }
        return state[this.stackName];
    }

    /**
     * Returns the active dialog instance on the top of the stack. Throws an error if the stack is 
     * empty so use `dialogs.getStack(context).length > 0` to protect calls where the stack could 
     * be empty.  
     * @param context Context object for the current turn of conversation with the user.
     */
    public getInstance<T extends Object = T>(context: BotContext): DialogInstance<T> {
        const stack = this.getStack<T>(context);
        if (stack.length < 1) { throw new Error(`DialogSet.getInstance(): No active dialog on the stack.`) }
        return stack[stack.length - 1];
    }

    /**
     * Ends the current dialog and starts a new dialog in its place.
     * @param context Context object for the current turn of conversation with the user.
     * @param dialogId ID of the new dialog to start.
     * @param dialogArgs (Optional) additional argument(s) to pass to the new dialog.  
     */
    public replace(context: BotContext, dialogId: string, dialogArgs?: any): Promise<void> {
        try {
            // Pop stack
            const stack = this.getStack(context);
            if (stack.length > 0) { stack.pop() }

            // Start replacement dialog
            return this.begin(context, dialogId, dialogArgs);
        } catch (err) {
            return Promise.reject(err);
        }
    }
}

function getConversationState(context: BotContext): ConversationState {
    if (!context.state.conversation) { throw new Error(`DialogSet: No conversation state found. Please add a BotStateManager instance to your bots middleware stack.`) }
    return context.state.conversation;
}

