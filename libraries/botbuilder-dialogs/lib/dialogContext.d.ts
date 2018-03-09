/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BotContext, BatchOutput, Activity } from 'botbuilder';
import { DialogInstance } from './dialog';
import { DialogSet } from './dialogSet';
import { PromptOptions } from './prompts/index';
import { Choice } from 'botbuilder-prompts';
export declare class DialogContext<C extends BotContext> {
    readonly dialogs: DialogSet<C>;
    readonly context: C;
    readonly stack: DialogInstance[];
    /**
     * Allows for batch based responses from the bot. Optional to use but you should add `BatchOutput`
     * to your adapters middleware stack if you do, otherwise you'll need to manually call
     * `dc.batch.flush()` somewhere within your bots logic.
     */
    readonly batch: BatchOutput;
    /**
     * Creates a new DialogContext instance.
     * @param dialogs Parent dialog set.
     * @param context Context for the current turn of conversation with the user.
     * @param stack Current dialog stack.
     */
    constructor(dialogs: DialogSet<C>, context: C, stack: DialogInstance[]);
    /** Returns the cached instance of the active dialog on the top of the stack or `undefined` if the stack is empty. */
    readonly instance: DialogInstance;
    /**
     * Pushes a new dialog onto the dialog stack.
     *
     * **Example usage:**
     *
     * ```JavaScript
     * const dc = dialogs.createContext(context, stack);
     * return dc.begin('greeting', user);
     * ```
     * @param dialogId ID of the dialog to start.
     * @param dialogArgs (Optional) additional argument(s) to pass to the dialog being started.
     */
    begin(dialogId: string, dialogArgs?: any): Promise<void>;
    /**
     * Helper function to simplify formatting the options for calling a prompt dialog. This helper will
     * construct a `PromptOptions` structure and then call [begin(context, dialogId, options)](#begin).
     *
     * **Example usage:**
     *
     * ```JavaScript
     * return dc.prompt('confirmPrompt', `Are you sure you'd like to quit?`);
     * ```
     * @param O (Optional) type of options expected by the prompt.
     * @param dialogId ID of the prompt to start.
     * @param prompt Initial prompt to send the user.
     * @param choicesOrOptions (Optional) array of choices to prompt the user for or additional prompt options.
     */
    prompt<O extends PromptOptions = PromptOptions>(dialogId: string, prompt: string | Partial<Activity>, choicesOrOptions?: O | (string | Choice)[], options?: O): Promise<void>;
    /**
     * Continues execution of the active dialog, if there is one, by passing the context object to
     * its `Dialog.continue()` method. You can check `context.responded` after the call completes
     * to determine if a dialog was run and a reply was sent to the user.
     *
     * **Example usage:**
     *
     * ```JavaScript
     * const dc = dialogs.createContext(context, dialogStack);
     * return dc.continue().then(() => {
     *      if (!context.responded) {
     *          return dc.begin('fallback');
     *      }
     * });
     * ```
     */
    continue(): Promise<void>;
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
     *      function (dc) {
     *          const elapsed = new Date().getTime() - started;
     *          dc.batch.reply(`I've been running for ${elapsed / 1000} seconds.`);
     *          return dc.end(elapsed);
     *      }
     * ]);
     * const started = new Date().getTime();
     * ```
     * @param result (Optional) result to pass to the parent dialogs `Dialog.resume()` method.
     */
    end(result?: any): Promise<void>;
    /**
     * Deletes any existing dialog stack thus cancelling all dialogs on the stack.
     *
     * **Example usage:**
     *
     * ```JavaScript
     * return dc.endAll();
     * ```
     */
    endAll(): Promise<void>;
    /**
     * Ends the active dialog and starts a new dialog in its place. This is particularly useful
     * for creating loops or redirecting to another dialog.
     *
     * **Example usage:**
     *
     * ```JavaScript
     * dialogs.add('loop', [
     *      function (dc, args) {
     *          dc.instance.state = args;
     *          return dc.begin(args.dialogId);
     *      },
     *      function (dc) {
     *          const args = dc.instance.state;
     *          return dc.replace('loop', args);
     *      }
     * ]);
     * ```
     * @param dialogId ID of the new dialog to start.
     * @param dialogArgs (Optional) additional argument(s) to pass to the new dialog.
     */
    replace(dialogId: string, dialogArgs?: any): Promise<void>;
}
