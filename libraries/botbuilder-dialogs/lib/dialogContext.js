"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
 */
class DialogContext {
    /**
     * Creates a new DialogContext instance.
     * @param dialogs Parent dialog set.
     * @param context Context for the current turn of conversation with the user.
     * @param state State object being used to persist the dialog stack.
     */
    constructor(dialogs, context, state) {
        this.dialogs = dialogs;
        this.context = context;
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
        return __awaiter(this, void 0, void 0, function* () {
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
            const result = yield dialog.dialogBegin(this, dialogArgs);
            return this.verifyTurnResult(result);
        });
    }
    prompt(dialogId, promptOrOptions, choices) {
        return __awaiter(this, void 0, void 0, function* () {
            let args;
            if (typeof promptOrOptions === 'object' && promptOrOptions.prompt !== undefined) {
                args = Object.assign({}, promptOrOptions);
            }
            else {
                args = { prompt: promptOrOptions, choices: choices };
            }
            return this.begin(dialogId, args);
        });
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
        return __awaiter(this, void 0, void 0, function* () {
            // Check for a dialog on the stack
            const instance = this.activeDialog;
            if (instance) {
                // Lookup dialog
                const dialog = this.dialogs.find(instance.id);
                if (!dialog) {
                    throw new Error(`DialogSet.continue(): Can't continue dialog. A dialog with an id of '${instance.id}' wasn't found.`);
                }
                // Check for existence of a continue() method
                let turnResult;
                if (dialog.dialogContinue) {
                    // Continue execution of dialog
                    turnResult = yield dialog.dialogContinue(this);
                }
                else {
                    // Just end the dialog
                    turnResult = yield this.end();
                }
                return this.verifyTurnResult(turnResult);
            }
            else {
                return { hasActive: false, hasResult: false };
            }
        });
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
        return __awaiter(this, void 0, void 0, function* () {
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
                let turnResult;
                if (dialog.dialogResume) {
                    // Return result to previous dialog
                    turnResult = yield dialog.dialogResume(this, result);
                }
                else {
                    // Just end the dialog and pass result to parent dialog
                    turnResult = yield this.end(result);
                }
                return this.verifyTurnResult(turnResult);
            }
            else {
                // Signal completion
                return { hasActive: false, hasResult: true, result: result };
            }
        });
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
        return __awaiter(this, void 0, void 0, function* () {
            // Pop stack
            if (this.stack.length > 0) {
                this.stack.pop();
            }
            // Start replacement dialog
            return yield this.begin(dialogId, dialogArgs);
        });
    }
    /**
     * Requests the [activeDialog](#activeDialog) to re-prompt the user for input.
     *
     * @remarks
     * The `Dialog.dialogReprompt()` method is optional for dialogs so if there's no active dialog
     * or the active dialog doesn't support re-prompting, this method will effectively be a no-op.
     */
    reprompt() {
        return __awaiter(this, void 0, void 0, function* () {
            // Check for a dialog on the stack
            const instance = this.activeDialog;
            if (instance) {
                // Lookup dialog
                const dialog = this.dialogs.find(instance.id);
                if (!dialog) {
                    throw new Error(`DialogSet.reprompt(): Can't find A dialog with an id of '${instance.id}'.`);
                }
                // Check for existence of a dialogReprompt() method
                let turnResult;
                if (dialog.dialogReprompt) {
                    // Ask dialog to re-prompt
                    turnResult = yield dialog.dialogReprompt(this);
                }
                else {
                    turnResult = { hasActive: true, hasResult: false };
                }
                return this.verifyTurnResult(turnResult);
            }
            else {
                return { hasActive: false, hasResult: false };
            }
        });
    }
    /** @private helper to ensure the turn result from a dialog looks correct. */
    verifyTurnResult(result) {
        result.hasActive = this.stack.length > 0;
        if (result.hasActive) {
            result.hasResult = false;
            result.result = undefined;
        }
        return result;
    }
}
exports.DialogContext = DialogContext;
//# sourceMappingURL=dialogContext.js.map