/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, Activity } from 'botbuilder';
import { DialogInstance } from './dialog';
import { DialogSet } from './dialogSet';
import { PromptOptions, ChoicePromptOptions } from './prompts/index';
import { Choice } from 'botbuilder-prompts';

/**
 * Result returned to the caller of one of the various stack manipulation methods and used to 
 * return the result from a final call to `DialogContext.end()` to the bots logic.
 */
export interface DialogResult<T = any> {
    /** This will be `true` if there is still an active dialog on the stack. */
    active: boolean;

    /** 
     * Result returned by a dialog that was just ended.  This will only be populated in certain
     * cases: 
     * 
     * - The bot calls `dc.begin()` to start a new dialog and the dialog ends immediately.
     * - The bot calls `dc.continue()` and a dialog that was active ends.
     * 
     * In all cases where it's populated, [active](#active) will be `false`. 
     */
    result?: T;
}

export class DialogContext<C extends TurnContext> {
    
     /**
      * Creates a new DialogContext instance.
      * @param dialogs Parent dialog set.
      * @param context Context for the current turn of conversation with the user.
      * @param stack Current dialog stack.
      */
    constructor(public readonly dialogs: DialogSet<C>, public readonly context: C, public readonly stack: DialogInstance[]) { }

    /** Returns the cached instance of the active dialog on the top of the stack or `undefined` if the stack is empty. */
    public get instance(): DialogInstance|undefined {
        return this.stack.length > 0 ? this.stack[this.stack.length - 1] : undefined;
    }

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
    public begin(dialogId: string, dialogArgs?: any): Promise<DialogResult> {
        try {
            // Lookup dialog
            const dialog = this.dialogs.find(dialogId);
            if (!dialog) { throw new Error(`DialogContext.begin(): A dialog with an id of '${dialogId}' wasn't found.`) }
            
            // Push new instance onto stack. 
            const instance: DialogInstance<any> = {
                id: dialogId,
                state: {}
            };
            this.stack.push(instance);
            
            // Call dialogs begin() method.
            return Promise.resolve(dialog.dialogBegin(this, dialogArgs)).then((r) => this.ensureDialogResult(r));
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
     * return dc.prompt('confirmPrompt', `Are you sure you'd like to quit?`);
     * ```
     * @param O (Optional) type of options expected by the prompt.
     * @param dialogId ID of the prompt to start.
     * @param prompt Initial prompt to send the user.
     * @param choicesOrOptions (Optional) array of choices to prompt the user for or additional prompt options.
     */
    public prompt<O extends PromptOptions = PromptOptions>(dialogId: string, prompt: string|Partial<Activity>, choicesOrOptions?: O|(string|Choice)[], options?: O): Promise<DialogResult> {
        const args = Object.assign({}, Array.isArray(choicesOrOptions) ? { choices: choicesOrOptions } : choicesOrOptions) as O;
        if (prompt) { args.prompt = prompt }
        return this.begin(dialogId, args);
    }

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
    public continue(): Promise<DialogResult> {
        try {
            // Check for a dialog on the stack
            const instance = this.instance;
            if (instance) {

                // Lookup dialog
                const dialog = this.dialogs.find(instance.id);
                if (!dialog) { throw new Error(`DialogSet.continue(): Can't continue dialog. A dialog with an id of '${instance.id}' wasn't found.`) }

                // Check for existence of a continue() method
                if (dialog.dialogContinue) {
                    // Continue execution of dialog
                    return Promise.resolve(dialog.dialogContinue(this)).then((r) => this.ensureDialogResult(r));
                } else {
                    // Just end the dialog
                    return this.end();
                }
            } else {
                return Promise.resolve({ active: false });
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
    public end(result?: any): Promise<DialogResult> {
        try {
            // Pop active dialog off the stack
            if (this.stack.length > 0) { this.stack.pop() }

            // Resume previous dialog
            const instance = this.instance;
            if (instance) {

                // Lookup dialog
                const dialog = this.dialogs.find(instance.id);
                if (!dialog) { throw new Error(`DialogContext.end(): Can't resume previous dialog. A dialog with an id of '${instance.id}' wasn't found.`) }
                
                // Check for existence of a resumeDialog() method
                if (dialog.dialogResume) {
                    // Return result to previous dialog
                    return Promise.resolve(dialog.dialogResume(this, result)).then((r) => this.ensureDialogResult(r));
                } else {
                    // Just end the dialog and pass result to parent dialog
                    return this.end(result);
                }
            } else {
                return Promise.resolve({ active: false, result: result });
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
     * await dc.endAll().begin('bookFlightTask');
     * ```
     */
    public endAll(): this{
        // Cancel any active dialogs
        if (this.stack.length > 0) {
            this.stack.splice(0, this.stack.length);
        }
        return this;
    }

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
    public replace(dialogId: string, dialogArgs?: any): Promise<DialogResult> {
        // Pop stack
        if (this.stack.length > 0) { this.stack.pop() }

        // Start replacement dialog
        return this.begin(dialogId, dialogArgs);
    }

    private ensureDialogResult(result: any): DialogResult {
        return typeof result === 'object' && typeof (result as DialogResult).active === 'boolean' ? result : { active: this.stack.length > 0 };
    }
}

