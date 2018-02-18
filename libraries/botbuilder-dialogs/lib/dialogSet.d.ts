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
export declare class DialogSet {
    private readonly stackName;
    private readonly dialogs;
    /**
     * Creates an empty dialog set.
     * @param stackName (Optional) name of the field to store the dialog stack in off the bots conversation state object. This defaults to 'dialogStack'.
     */
    constructor(stackName?: string);
    /**
     * Adds a new dialog to the set and returns the added dialog.
     * @param dialogId Unique ID of the dialog within the set.
     * @param dialogOrSteps Either a new dialog or an array of waterfall steps to execute. If waterfall steps are passed in they will automatically be passed into an new instance of a `Waterfall` class.
     */
    add<T extends Dialog>(dialogId: string, dialogOrSteps: T): T;
    add(dialogId: string, dialogOrSteps: WaterfallStep[]): Waterfall;
    /**
     * Pushes a new dialog onto the dialog stack.
     * @param context Context object for the current turn of conversation with the user. This will get mapped into a `DialogContext` and passed to the dialog started.
     * @param dialogId ID of the dialog to start.
     * @param dialogArgs (Optional) additional argument(s) to pass to the dialog being started.
     */
    begin(context: BotContext, dialogId: string, dialogArgs?: any): Promise<void>;
    /**
     * Helper function to simplify formatting the options for calling a prompt dialog.
     * @param context Context object for the current turn of conversation with the user. This will get mapped into a `DialogContext` and passed to the dialog started.
     * @param dialogId ID of the prompt to start.
     * @param prompt Initial prompt to send the user.
     * @param choices Array of choices to prompt the user for.
     * @param options (Optional) additional options to configure the prompt.
     */
    prompt<O extends PromptOptions = PromptOptions>(context: BotContext, dialogId: string, prompt: string | Partial<Activity>, options?: O): Promise<void>;
    prompt<O extends ChoicePromptOptions = ChoicePromptOptions>(context: BotContext, dialogId: string, prompt: string | Partial<Activity>, choices: (string | Choice)[], options?: O): Promise<void>;
    /**
     * Deletes any existing dialog stack, cancelling any dialogs on the stack.
     * @param context Context object for the current turn of conversation with the user.
     */
    endAll(context: BotContext): this;
    /**
     * Continues execution of the active dialog, if there is one, by passing the
     * context object to its `Dialog.continue()` method.
     * @param context Context object for the current turn of conversation with the user. This will get mapped into a `DialogContext` and passed to the dialog started.
     */
    continue(context: BotContext): Promise<void>;
    end(context: BotContext, result?: any): Promise<void>;
    /**
     * Looks up to see if a dialog with the given ID has been registered with the set. If not an
     * attempt will be made to look up the dialog as a prompt. If the dialog still can't be found,
     * then `undefined` will be returned.
     * @param dialogId ID of the dialog/prompt to lookup.
     */
    find(dialogId: string): Dialog | undefined;
    /**
     * Returns the dialog stack persisted for a conversation.
     * @param context Context object for the current turn of conversation with the user.
     */
    getStack<T extends Object = {}>(context: BotContext): DialogInstance<T>[];
    /**
     * Returns the active dialog instance on the top of the stack. Throws an error if the stack is
     * empty so use `dialogs.getStack(context).length > 0` to protect calls where the stack could
     * be empty.
     * @param context Context object for the current turn of conversation with the user.
     */
    getInstance<T extends Object = T>(context: BotContext): DialogInstance<T>;
    /**
     * Ends the current dialog and starts a new dialog in its place.
     * @param context Context object for the current turn of conversation with the user.
     * @param dialogId ID of the new dialog to start.
     * @param dialogArgs (Optional) additional argument(s) to pass to the new dialog.
     */
    replace(context: BotContext, dialogId: string, dialogArgs?: any): Promise<void>;
}
