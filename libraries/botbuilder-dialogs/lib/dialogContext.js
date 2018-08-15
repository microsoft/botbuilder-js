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
const dialog_1 = require("./dialog");
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
        if (!Array.isArray(state.dialogStack)) {
            state.dialogStack = [];
        }
        this.dialogs = dialogs;
        this.context = context;
        this.stack = state.dialogStack;
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
     * @param options (Optional) additional argument(s) to pass to the dialog being started.
     */
    begin(dialogId, options) {
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
            const turnResult = yield dialog.dialogBegin(this, options);
            return this.verifyTurnResult(turnResult);
        });
    }
    /**
     * Cancels all dialogs on the stack resulting in an empty stack.
     */
    cancelAll() {
        return __awaiter(this, void 0, void 0, function* () {
            while (this.stack.length > 0) {
                yield this.endActiveDialog(dialog_1.DialogReason.cancelCalled);
            }
        });
    }
    prompt(dialogId, promptOrOptions, choices) {
        return __awaiter(this, void 0, void 0, function* () {
            let options;
            if (typeof promptOrOptions === 'object' && promptOrOptions.prompt !== undefined) {
                options = Object.assign({}, promptOrOptions);
            }
            else {
                options = { prompt: promptOrOptions, choices: choices };
            }
            return this.begin(dialogId, options);
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
                    throw new Error(`DialogContext.continue(): Can't continue dialog. A dialog with an id of '${instance.id}' wasn't found.`);
                }
                // Continue execution of dialog
                const turnResult = yield dialog.dialogContinue(this);
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
     * @param result (Optional) result to pass to the parent dialogs `Dialog.resume()` method.
     */
    end(result) {
        return __awaiter(this, void 0, void 0, function* () {
            // End the active dialog
            yield this.endActiveDialog(dialog_1.DialogReason.endCalled);
            // Resume parent dialog
            const instance = this.activeDialog;
            if (instance) {
                // Lookup dialog
                const dialog = this.dialogs.find(instance.id);
                if (!dialog) {
                    throw new Error(`DialogContext.end(): Can't resume previous dialog. A dialog with an id of '${instance.id}' wasn't found.`);
                }
                // Return result to previous dialog
                const turnResult = yield dialog.dialogResume(this, dialog_1.DialogReason.endCalled, result);
                return this.verifyTurnResult(turnResult);
            }
            else {
                // Signal completion
                return { hasActive: false, hasResult: true, result: result };
            }
        });
    }
    /**
     * Ends the active dialog and starts a new dialog in its place.
     *
     * @remarks
     * This method is particularly useful for creating conversational loops within your bot:
     * @param dialogId ID of the new dialog to start.
     * @param options (Optional) additional argument(s) to pass to the new dialog.
     */
    replace(dialogId, options) {
        return __awaiter(this, void 0, void 0, function* () {
            // End the active dialog
            yield this.endActiveDialog(dialog_1.DialogReason.replaceCalled);
            // Start replacement dialog
            return yield this.begin(dialogId, options);
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
                // Ask dialog to re-prompt if supported
                yield dialog.dialogReprompt(this.context, instance);
            }
        });
    }
    endActiveDialog(reason) {
        return __awaiter(this, void 0, void 0, function* () {
            let instance = this.activeDialog;
            if (instance) {
                // Lookup dialog
                const dialog = this.dialogs.find(instance.id);
                if (dialog) {
                    // Notify dialog of end
                    yield dialog.dialogEnd(this.context, instance, reason);
                }
                // Pop dialog off stack
                this.stack.pop();
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