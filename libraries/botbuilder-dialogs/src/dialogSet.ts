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
 *
 * **Example usage:**
 * 
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
export class DialogSet {
    private readonly stackName: string;
    private readonly dialogs: { [id:string]: Dialog; } = {};

    /**
     * Creates an empty dialog set. The ability to name the sets dialog stack means that multiple
     * stacks can coexist within the same bot.  Middleware can use their own private set of 
     * dialogs without fear of colliding with the bots dialog stack.
     *
     * **Example usage:**
     * 
     * ```JavaScript
     * const dialogs = new DialogSet('myPrivateStack');
     * ```
     * @param stackName (Optional) name of the field to store the dialog stack in off the bots conversation state object. This defaults to 'dialogStack'.
     */
    constructor (stackName?: string) {
        this.stackName = stackName || 'dialogStack';
    }


    /**
     * Adds a new dialog to the set and returns the added dialog.
     * 
     * **Example usage:**
     * 
     * ```JavaScript
     * dialogs.add('greeting', [
     *      function (context, user) {
     *          context.reply(`Hello ${user.name}... I'm a bot :)`);
     *          return dialogs.end(context);
     *      } 
     * ]);
     * ```
     * @param T Type of the dialog being set and returned.
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
     * 
     * **Example usage:**
     * 
     * ```JavaScript
     * return dialogs.begin(context, 'greeting', user);
     * ```
     * @param context Context object for the current turn of conversation with the user.
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
     * Helper function to simplify formatting the options for calling a prompt dialog. This helper will
     * construct a `PromptOptions` structure and then call [begin(context, dialogId, options)](#begin).
     * 
     * **Example usage:**
     * 
     * ```JavaScript
     * return dialogs.prompt(context, 'confirmPrompt', `Are you sure you'd like to quit?`);
     * ```
     * @param O (Optional) type of options expected by the prompt.
     * @param context Context object for the current turn of conversation with the user.
     * @param dialogId ID of the prompt to start.
     * @param prompt Initial prompt to send the user.
     * @param choicesOrOptions (Optional) array of choices to prompt the user for or additional prompt options.
     */
    public prompt<O extends PromptOptions = PromptOptions>(context: BotContext, dialogId: string, prompt: string|Partial<Activity>, choicesOrOptions?: O|(string|Choice)[], options?: O): Promise<void> {
        const args = Object.assign({}, Array.isArray(choicesOrOptions) ? { choices: choicesOrOptions } : choicesOrOptions) as O;
        if (prompt) { args.prompt = prompt }
        return this.begin(context, dialogId, args);
    }

    /**
     * Continues execution of the active dialog, if there is one, by passing the context object to 
     * its `Dialog.continue()` method. You can check `context.responded` after the call completes
     * to determine if a dialog was run and a reply was sent to the user.
     * 
     * **Example usage:**
     * 
     * ```JavaScript
     * return dialogs.continue(context).then(() => {
     *      if (!dialog.responded) {
     *          return dialogs.begin(context, 'fallback');
     *      }
     * });
     * ```
     * @param context Context object for the current turn of conversation with the user.
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

    /**
     * Ends a dialog by popping it off the stack and returns an optional result to the dialogs
     * parent. The parent dialog is the dialog the started the on being ended via a call to 
     * either [begin()](#begin) or [prompt()](#prompt). 
     * 
     * The parent dialog will have its `Dialog.resume()` method invoked with any returned 
     * result. If the parent dialog hasn't implemented a `resume()` method then it will be
     * automatically ended as well and the result passed to its parent. If there are no more
     * parent dialogs on the stack then processing of the turn will end. 
      * 
     * **Example usage:**
     * 
     * ```JavaScript
     * dialogs.add('showUptime', [
     *      function (context) {
     *          const elapsed = new Date().getTime() - started;
     *          context.reply(`I've been running for ${elapsed / 1000} seconds.`);
     *          return dialogs.end(context, elapsed);
     *      }
     * ])
     * const started = new Date().getTime();
     * ```
     * @param context Context object for the current turn of conversation with the user.
     * @param result (Optional) result to pass to the parent dialogs `Dialog.resume()` method.
     */
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
     * Deletes any existing dialog stack thus cancelling all dialogs on the stack.
     * 
     * **Example usage:**
     * 
     * ```JavaScript
     * return dialogs.endAll(context)
     *      .then(() => dialogs.begin(context, 'addAlarm'));
     * ```
     * @param context Context object for the current turn of conversation with the user.
     */
    public endAll(context: BotContext): Promise<void> {
        try {
            // Cancel any current dialogs
            const state = getConversationState(context);
            state[this.stackName] = [];
            return Promise.resolve();
        } catch (err) {
            return Promise.reject(err);
        }
    }

    /**
     * Finds a dialog that was previously added to the set using [add()](#add). 
     * 
     * **Example usage:**
     * 
     * ```JavaScript
     * const dialog = dialogs.find('greeting');
     * ```
     * @param T (Optional) type of dialog returned.
     * @param dialogId ID of the dialog/prompt to lookup.
     */
    public find<T extends Dialog = Dialog>(dialogId: string): T|undefined {
        return this.dialogs.hasOwnProperty(dialogId) ? this.dialogs[dialogId] as T : undefined;
    }

    /**
     * Returns the dialog stack persisted for a conversation.  
     * 
     * **Example usage:**
     * 
     * ```JavaScript
     * const hasActiveDialog = dialogs.getStack(context).length > 0;
     * ```
     * @param context Context object for the current turn of conversation with the user.
     */
    public getStack(context: BotContext): DialogInstance<any>[] {
        const state = getConversationState(context);
        if (!Array.isArray(state[this.stackName])) { state[this.stackName] = [] }
        return state[this.stackName];
    }

    /**
     * Returns the active dialog instance on the top of the stack. Throws an error if the stack is 
     * empty so use `dialogs.getStack(context).length > 0` to protect calls where the stack could 
     * be empty.  
     * 
     * **Example usage:**
     * 
     * ```JavaScript
     * const dialogState = dialogs.getInstance(context).state;
     * ```
     * @param T (Optional) type of dialog state being persisted by the instance.
     * @param context Context object for the current turn of conversation with the user.
     */
    public getInstance<T extends Object = { [key:string]: any; }>(context: BotContext): DialogInstance<T> {
        const stack = this.getStack(context);
        if (stack.length < 1) { throw new Error(`DialogSet.getInstance(): No active dialog on the stack.`) }
        return stack[stack.length - 1];
    }

    /**
     * Ends the current dialog and starts a new dialog in its place. This is particularly useful 
     * for creating loops or redirecting to another dialog.
     * 
     * **Example usage:**
     * 
     * ```JavaScript
     * dialogs.add('loop', [
     *      function (context, args) {
     *          dialogs.getInstance(context).state = args;
     *          return dialogs.begin(context, args.dialogId);
     *      },
     *      function (context) {
     *          const args = dialogs.getInstance(context).state;
     *          return dialogs.replace(context, 'loop', args);
     *      }
     * ]);
     * ```
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

