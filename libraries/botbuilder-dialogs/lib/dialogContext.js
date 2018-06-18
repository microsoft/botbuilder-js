"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
 * @param C The type of `TurnContext` being passed around. This simply lets the typing information for any context extensions flow through to dialogs and waterfall steps.
 */
class DialogContext {
    /**
     * Creates a new DialogContext instance.
     * @param dialogs Parent dialog set.
     * @param context Context for the current turn of conversation with the user.
     * @param state State object being used to persist the dialog stack.
     * @param onCompleted (Optional) handler to call when the the last dialog on the stack completes.
     * @param onCompleted.result The result returned by the dialog that just completed.
     */
    constructor(dialogs, context, state, onCompleted) {
        this.dialogs = dialogs;
        this.context = context;
        this.onCompleted = onCompleted;
        if (!Array.isArray(state['dialogStack'])) {
            state['dialogStack'] = [];
        }
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
    get activeDialog() {
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
    begin(dialogId, dialogArgs) {
        try {
            // Lookup dialog
            const dialog = this.dialogs.find(dialogId);
            if (!dialog) {
                throw new Error(`DialogContext.begin(): A dialog with an id of '${dialogId}' wasn't found.`);
            }
            // Push new instance onto stack. 
            const instance = {
                id: dialogId,
                state: {}
            };
            this.stack.push(instance);
            // Call dialogs begin() method.
            return Promise.resolve(dialog.dialogBegin(this, dialogArgs));
        }
        catch (err) {
            return Promise.reject(err);
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
     * @param O (Optional) type of options expected by the prompt.
     * @param dialogId ID of the prompt to start.
     * @param prompt Initial prompt to send the user.
     * @param choicesOrOptions (Optional) array of choices to prompt the user for or additional prompt options.
     * @param options (Optional) additional prompt options.
     */
    prompt(dialogId, prompt, choicesOrOptions, options) {
        const args = Object.assign({}, Array.isArray(choicesOrOptions) ? { choices: choicesOrOptions } : choicesOrOptions, options);
        if (prompt) {
            args.prompt = prompt;
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
    continue() {
        try {
            // Check for a dialog on the stack
            const instance = this.activeDialog;
            if (instance) {
                // Lookup dialog
                const dialog = this.dialogs.find(instance.id);
                if (!dialog) {
                    throw new Error(`DialogSet.continue(): Can't continue dialog. A dialog with an id of '${instance.id}' wasn't found.`);
                }
                // Check for existence of a continue() method
                if (dialog.dialogContinue) {
                    // Continue execution of dialog
                    return Promise.resolve(dialog.dialogContinue(this));
                }
                else {
                    // Just end the dialog
                    return this.end();
                }
            }
            else {
                return Promise.resolve();
            }
        }
        catch (err) {
            return Promise.reject(err);
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
    end(result) {
        try {
            // Pop active dialog off the stack
            if (this.stack.length > 0) {
                this.stack.pop();
            }
            // Resume previous dialog
            const instance = this.activeDialog;
            if (instance) {
                // Lookup dialog
                const dialog = this.dialogs.find(instance.id);
                if (!dialog) {
                    throw new Error(`DialogContext.end(): Can't resume previous dialog. A dialog with an id of '${instance.id}' wasn't found.`);
                }
                // Check for existence of a resumeDialog() method
                if (dialog.dialogResume) {
                    // Return result to previous dialog
                    return Promise.resolve(dialog.dialogResume(this, result));
                }
                else {
                    // Just end the dialog and pass result to parent dialog
                    return this.end(result);
                }
            }
            else {
                // Signal completion
                if (this.onCompleted) {
                    this.onCompleted(result);
                }
                return Promise.resolve();
            }
        }
        catch (err) {
            return Promise.reject(err);
        }
    }
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
    endAll() {
        // Cancel any active dialogs
        if (this.stack.length > 0) {
            this.stack.splice(0, this.stack.length);
        }
        return this;
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
    replace(dialogId, dialogArgs) {
        // Pop stack
        if (this.stack.length > 0) {
            this.stack.pop();
        }
        // Start replacement dialog
        return this.begin(dialogId, dialogArgs);
    }
}
exports.DialogContext = DialogContext;
//# sourceMappingURL=dialogContext.js.map