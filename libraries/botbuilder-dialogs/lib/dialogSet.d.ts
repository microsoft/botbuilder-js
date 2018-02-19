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
import { PromptOptions } from './prompts/index';
import { Choice } from 'botbuilder-choices';
/**
 * A related set of dialogs that can all call each other.
 *
 * ### Usage
 * ```JavaScript
 * const { Bot, MemoryStorage, BotStateManager } = require('botbuilder');
 * const { ConsoleAdapter } = require('botbuilder-node');
 * const { DialogSet } = require('botbuilder-dialogs');
 *
 * const dialogs = new DialogSet();
 *
 * dialogs.add('greeting', [
 *      function (context) {
 *          context.reply(`Hello... I'm a bot :)`);
 *          return dialogs.end(context);
 *      }
 * ]);
 *
 * const adapter = new ConsoleAdapter().listen();
 * const bot = new Bot(adapter)
 *      .use(new MemoryStorage())
 *      .use(new BotStateManager())
 *      .onReceive((context) => {
 *          return dialogs.continue(context).then(() => {
 *              // If nothing has responded start greeting dialog
 *              if (!context.responded) {
 *                  return dialogs.begin(context, 'greeting');
 *              }
 *          });
 *      });
 * ```
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
     * @param context Context object for the current turn of conversation with the user.
     * @param dialogId ID of the dialog to start.
     * @param dialogArgs (Optional) additional argument(s) to pass to the dialog being started.
     */
    begin(context: BotContext, dialogId: string, dialogArgs?: any): Promise<void>;
    /**
     * Helper function to simplify formatting the options for calling a prompt dialog.
     * @param context Context object for the current turn of conversation with the user.
     * @param dialogId ID of the prompt to start.
     * @param prompt Initial prompt to send the user.
     * @param choicesOrOptions (Optional) array of choices to prompt the user for or additional prompt options.
     */
    prompt<O extends PromptOptions = PromptOptions>(context: BotContext, dialogId: string, prompt: string | Partial<Activity>, choicesOrOptions?: O | (string | Choice)[], options?: O): Promise<void>;
    /**
     * Continues execution of the active dialog, if there is one, by passing the
     * context object to its `Dialog.continue()` method.
     * @param context Context object for the current turn of conversation with the user.
     */
    continue(context: BotContext): Promise<void>;
    /**
     * Ends a dialog by popping it off the stack and returns an optional result to the dialogs
     * parent. The parent dialog is the dialog the started the on being ended via a call to
     * either [begin()](#begin) or [prompt()](#prompt).
     *
     * The parent dialog will have its `Dialog.resume()` method invoked with any returned
     * result. If the parent dialog hasn't implemented a `resume()` method then it will be
     * automatically ended as well and the result passed to its parent. If there are no more
     * parent dialogs on the stack then processing of the turn will end.
     * @param context Context object for the current turn of conversation with the user.
     * @param result (Optional) result to pass to the parent dialogs `Dialog.resume()` method.
     */
    end(context: BotContext, result?: any): Promise<void>;
    /**
     * Deletes any existing dialog stack thus cancelling all dialogs on the stack.
     * @param context Context object for the current turn of conversation with the user.
     */
    endAll(context: BotContext): Promise<void>;
    /**
     * Finds a dialog that was previously added to the set using [add()](#add).
     * @param dialogId ID of the dialog/prompt to lookup.
     */
    find<T extends Dialog>(dialogId: string): T | undefined;
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
    getInstance<T extends Object = {
        [key: string]: any;
    }>(context: BotContext): DialogInstance<T>;
    /**
     * Ends the current dialog and starts a new dialog in its place.
     * @param context Context object for the current turn of conversation with the user.
     * @param dialogId ID of the new dialog to start.
     * @param dialogArgs (Optional) additional argument(s) to pass to the new dialog.
     */
    replace(context: BotContext, dialogId: string, dialogArgs?: any): Promise<void>;
}
