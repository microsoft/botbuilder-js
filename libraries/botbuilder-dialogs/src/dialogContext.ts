/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, Activity } from 'botbuilder';
import { DialogInstance, DialogTurnResult, DialogEndReason } from './dialog';
import { DialogSet } from './dialogSet';
import { PromptOptions } from './prompts';
import { Choice } from 'botbuilder-prompts';

/**
 * A context object used to manipulate a dialog stack.
 * 
 * @remarks
 * This is typically created through a call to `DialogSet.createContext()` and is then passed 
 * through to all of the bots dialogs and waterfall steps.
 * 
 * ```JavaScript
 * const conversation = conversationState.get(context);
 * const dc = dialogs.createContext(context, conversation);  
 * ```
 */
export class DialogContext {
    /** Current dialog stack. */
    public readonly stack: DialogInstance[];

     /**
      * Creates a new DialogContext instance.
      * @param dialogs Parent dialog set.
      * @param context Context for the current turn of conversation with the user.
      * @param state State object being used to persist the dialog stack.
      */
    constructor(public readonly dialogs: DialogSet, public readonly context: TurnContext, state: object) { 
        if (!Array.isArray(state['dialogStack'])) { state['dialogStack'] = [] } 
        this.stack = state['dialogStack'];
    }

    /** 
     * Returns the cached instance of the active dialog on the top of the stack or `undefined` if 
     * the stack is empty.
     * 
     * @remarks
     * Within a dialog or waterfall step this can be used to access the active dialogs state object:
     * 
     * ```JavaScript
     * dc.activeDialog.state.profile = {};
     * ```
     * 
     * Within the bots routing logic this can be used to determine if there's an active dialog on 
     * the stack:
     * 
     * ```JavaScript
     * if (!dc.activeDialog) {
     *     await dc.context.sendActivity(`No dialog is active`);
     *     return;
     * }
     * ``` 
     */
    public get activeDialog(): DialogInstance|undefined {
        return this.stack.length > 0 ? this.stack[this.stack.length - 1] : undefined;
    }

    /**
     * Pushes a new dialog onto the dialog stack.
     * 
     * @remarks
     * This example starts a 'greeting' dialog and passes it the current user object:
     * 
     * ```JavaScript
     * await dc.begin('greeting', user);
     * ```
     * @param dialogId ID of the dialog to start.
     * @param dialogArgs (Optional) additional argument(s) to pass to the dialog being started.
     */
    public async begin(dialogId: string, dialogArgs?: any): Promise<DialogTurnResult> {
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
        const result = await dialog.dialogBegin(this, dialogArgs);
        return this.verifyTurnResult(result);
    }

    /**
     * Cancels all dialogs on the stack resulting in an empty stack.
     */
    public async cancelAll(): Promise<void> {
        while (this.stack.length > 0) {
            // Find dialog and notify it of cancellation
            const instance = this.activeDialog;
            const dialog = this.dialogs.find(instance.id);
            if (dialog && dialog.dialogEnd) {
                await dialog.dialogEnd(this.context, instance, DialogEndReason.cancelled);
            }

            // Pop dialog off stack.
            this.stack.pop();
        }
    }

    /**
     * Helper function to simplify formatting the options for calling a prompt dialog. 
     * 
     * @remarks
     * This is a lightweight wrapper abound [begin()](#begin). It fills in a `PromptOptions` 
     * structure and then passes it through to `dc.begin(dialogId, options)`.
     * 
     * ```JavaScript
     * await dc.prompt('confirmPrompt', `Are you sure you'd like to quit?`);
     * ```
     * @param dialogId ID of the prompt to start.
     * @param promptOrOptions Initial prompt to send the user or a set of options to configure the prompt with..
     * @param choicesOrOptions (Optional) array of choices associated with the prompt.
     */
    public async prompt(dialogId: string, promptOrOptions: string|Partial<Activity>, choices?: (string|Choice)[]): Promise<DialogTurnResult>;
    public async prompt(dialogId: string, promptOrOptions: PromptOptions): Promise<DialogTurnResult>;
    public async prompt(dialogId: string, promptOrOptions: string|Partial<Activity>|PromptOptions, choices?: (string|Choice)[]): Promise<DialogTurnResult> {
        let args: PromptOptions;
        if (typeof promptOrOptions === 'object' && (promptOrOptions as PromptOptions).prompt !== undefined) {
            args = Object.assign({}, promptOrOptions as PromptOptions);
        } else {
            args = { prompt: promptOrOptions, choices: choices };
        }
        return this.begin(dialogId, args);
    }

    /**
     * Continues execution of the active dialog, if there is one.
     * 
     * @remarks
     * The stack will be inspected and the active dialog will be retrieved using `DialogSet.find()`. 
     * The dialog will then have its optional `continueDialog()` method executed. You can check 
     * `context.responded` after the call completes to determine if a dialog was run and a reply 
     * was sent to the user.
     * 
     * > [!NOTE]
     * > If the active dialog fails to implement `continueDialog()` the [end()](#end) method will 
     * > be automatically called. This is done as a safety mechanism to avoid users getting trapped
     * > within a dialog.
     * 
     * ```JavaScript
     * await dc.continue();
     * if (!context.responded) {
     *     await dc.context.sendActivity(`I'm sorry. I didn't understand.`);
     * }
     * ```
     */
    public async continue(): Promise<DialogTurnResult> {
        // Check for a dialog on the stack
        const instance = this.activeDialog;
        if (instance) {
            // Lookup dialog
            const dialog = this.dialogs.find(instance.id);
            if (!dialog) { throw new Error(`DialogSet.continue(): Can't continue dialog. A dialog with an id of '${instance.id}' wasn't found.`) }

            // Check for existence of a continue() method
            let turnResult: DialogTurnResult;
            if (dialog.dialogContinue) {
                // Continue execution of dialog
                turnResult = await dialog.dialogContinue(this);
            } else {
                // Just end the dialog
                turnResult = await this.end();
            }
            return this.verifyTurnResult(turnResult);
        } else {
            return { hasActive: false, hasResult: false };
        }
    }

    /**
     * Ends a dialog by popping it off the stack and returns an optional result to the dialogs
     * parent.
     * 
     * @remarks
     * The parent dialog is the dialog the started the one being ended via a call to either 
     * [begin()](#begin) or [prompt()](#prompt). 
     * 
     * The parent dialog will have its `resumeDialog()` method invoked with any returned result. 
     * If the parent dialog hasn't implemented resumeDialog() then it will be popped off the stack
     * as well and any result will be passed it its parent. If there are no more parent dialogs on 
     * the stack then processing of the turn will end. 
      * 
     * ```JavaScript
     * dialogs.add('showUptime', [
     *      async function (dc) {
     *          const elapsed = new Date().getTime() - started;
     *          await dc.context.sendActivity(`I've been running for ${elapsed / 1000} seconds.`);
     *          await dc.end(elapsed);
     *      }
     * ]);
     * const started = new Date().getTime();
     * ```
     * @param result (Optional) result to pass to the parent dialogs `Dialog.resume()` method.
     */
    public async end(result?: any): Promise<DialogTurnResult> {
        // End the active dialog
        let instance = this.activeDialog;
        if (instance) {
            // Lookup dialog
            const dialog = this.dialogs.find(instance.id);
            if (!dialog) { throw new Error(`DialogContext.end(): Can't end current dialog. A dialog with an id of '${instance.id}' wasn't found.`) }

            // Notify dialog of end
            if (dialog.dialogEnd) {
                await dialog.dialogEnd(this.context, instance, DialogEndReason.completed);
            }

            // Pop dialog off stack
            this.stack.pop() 
        }

        // Resume parent dialog
        instance = this.activeDialog;
        if (instance) {
            // Lookup dialog
            const dialog = this.dialogs.find(instance.id);
            if (!dialog) { throw new Error(`DialogContext.end(): Can't resume previous dialog. A dialog with an id of '${instance.id}' wasn't found.`) }
            
            // Check for existence of a resumeDialog() method
            let turnResult: DialogTurnResult;
            if (dialog.dialogResume) {
                // Return result to previous dialog
                turnResult = await dialog.dialogResume(this, result);
            } else {
                // Just end the dialog and pass result to parent dialog
                turnResult = await this.end(result);
            }
            return this.verifyTurnResult(turnResult);
        } else {
            // Signal completion
            return { hasActive: false, hasResult: true, result: result };
        }
    }

    /**
     * Ends the active dialog and starts a new dialog in its place. 
     * 
     * @remarks
     * This method is particularly useful for creating conversational loops within your bot:
     * 
     * ```JavaScript
     * dialogs.add('forEach', [
     *      async function (dc, args) {
     *          // Validate args
     *          if (!args || !args.dialogId || !Array.isArray(args.items)) { throw new Error(`forEach: invalid args`) }
     *          if (args.index === undefined) { args.index = 0 }
     * 
     *          // Persist args
     *          dc.activeDialog.state = args;
     * 
     *          // Invoke dialog with next item or end
     *          if (args.index < args.items.length) {
     *              await dc.begin(args.dialogId, args.items[args.index]);
     *          } else {
     *              await dc.end();
     *          }
     *      },
     *      function (dc) {
     *          // Next item
     *          const args = dc.activeDialog.state;
     *          args.index++;
     *          return dc.replace('forEach', args);
     *      }
     * ]);
     * ```
     * @param dialogId ID of the new dialog to start.
     * @param dialogArgs (Optional) additional argument(s) to pass to the new dialog.  
     */
    public async replace(dialogId: string, dialogArgs?: any): Promise<DialogTurnResult> {
        // Pop stack
        if (this.stack.length > 0) { this.stack.pop() }

        // Start replacement dialog
        return await this.begin(dialogId, dialogArgs);
    }

    /**
     * Requests the [activeDialog](#activeDialog) to re-prompt the user for input.
     * 
     * @remarks
     * The `Dialog.dialogReprompt()` method is optional for dialogs so if there's no active dialog
     * or the active dialog doesn't support re-prompting, this method will effectively be a no-op. 
     */
    public async reprompt(): Promise<void> {
        // Check for a dialog on the stack
        const instance = this.activeDialog;
        if (instance) {
            // Lookup dialog
            const dialog = this.dialogs.find(instance.id);
            if (!dialog) { throw new Error(`DialogSet.reprompt(): Can't find A dialog with an id of '${instance.id}'.`) }

            // Ask dialog to re-prompt if supported
            if (dialog.dialogReprompt) {
                await dialog.dialogReprompt(this.context, instance);
            }
        }
    }


    /** @private helper to ensure the turn result from a dialog looks correct. */
    private verifyTurnResult(result: DialogTurnResult): DialogTurnResult {
        result.hasActive = this.stack.length > 0;
        if (result.hasActive) {
            result.hasResult = false;
            result.result = undefined;
        }
        return result; 
    }
}

