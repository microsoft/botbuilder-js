/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, Activity } from '../../botbuilder/lib';
import { DialogInstance, DialogTurnResult } from './dialog';
import { DialogSet } from './dialogSet';
import { PromptOptions } from './prompts';
import { Choice } from '../../botbuilder-prompts/lib';
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
export declare class DialogContext {
    readonly dialogs: DialogSet;
    readonly context: TurnContext;
    /** Current dialog stack. */
    readonly stack: DialogInstance[];
    /**
     * Creates a new DialogContext instance.
     * @param dialogs Parent dialog set.
     * @param context Context for the current turn of conversation with the user.
     * @param state State object being used to persist the dialog stack.
     */
    constructor(dialogs: DialogSet, context: TurnContext, state: object);
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
    readonly activeDialog: DialogInstance | undefined;
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
    begin(dialogId: string, dialogArgs?: any): Promise<DialogTurnResult>;
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
    prompt(dialogId: string, promptOrOptions: string | Partial<Activity>, choices?: (string | Choice)[]): Promise<DialogTurnResult>;
    prompt(dialogId: string, promptOrOptions: PromptOptions): Promise<DialogTurnResult>;
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
    continue(): Promise<DialogTurnResult>;
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
    end(result?: any): Promise<DialogTurnResult>;
    /**
     * Deletes any existing dialog stack thus cancelling all dialogs on the stack.
     *
     * @remarks
     * As a best practice you'll typically want to call endAll() from within your bots interruption
     * logic before starting any new dialogs:
     *
     * ```JavaScript
     * await dc.endAll().begin('bookFlightTask');
     * ```
     */
    endAll(): this;
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
    replace(dialogId: string, dialogArgs?: any): Promise<DialogTurnResult>;
    /** @private helper to ensure the turn result from a dialog looks correct. */
    private verifyTurnResult(result);
}
