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
const dialogContext_1 = require("./dialogContext");
const dialogSet_1 = require("./dialogSet");
/**
 * Base class for all dialogs.
 * @param R (Optional) type of result that's expected to be returned by the dialog.
 * @param O (Optional) options that can be passed into the [begin()](#begin) method.
 */
class Dialog {
    /**
     * Starts the dialog when its called in isolation from a bot that isn't dialog based.
     *
     * @remarks
     * The bot is responsible for maintaining the sticky-ness of the dialog. To do that it should
     * persist the state object it passed into the dialog as part of its overall state when the
     * turn completes. When the user replies it then needs to pass the persisted state object into
     * a call to the dialogs [continue()](#continue) method.
     *
     * Depending on the dialog, its possible for the dialog to finish immediately so it's advised
     * to check the completion object returned by `begin()` and ensure that the dialog is still
     * active before continuing.
     *
     * ```JavaScript
     * const state = {};
     * const completion = await dialog.begin(context, state);
     * if (completion.isCompleted) {
     *     const value = completion.result;
     * }
     * ```
     * @param context Context for the current turn of the conversation with the user.
     * @param state A state object that the dialog will use to persist its current state. This should be an empty object which the dialog will populate. The bot should persist this with its other conversation state for as long as the dialog is still active.
     * @param options (Optional) additional options supported by the dialog.
     */
    begin(context, state, options) {
        return __awaiter(this, void 0, void 0, function* () {
            // Create empty dialog set and add ourselves to it
            const dialogs = new dialogSet_1.DialogSet();
            dialogs.add('dialog', this);
            // Start the dialog
            const dc = new dialogContext_1.DialogContext(dialogs, context, state);
            return yield dc.begin('dialog', options);
        });
    }
    /**
     * Passes a users reply to a dialog thats being used in isolation.
     *
     * @remarks
     * The bot should keep calling `continue()` for future turns until the dialog returns a
     * completion object with `isCompleted == true`. To cancel or interrupt the prompt simply
     * delete the `state` object being persisted.
     *
     * ```JavaScript
     * const completion = await dialog.continue(context, state);
     * if (completion.isCompleted) {
     *     const value = completion.result;
     * }
     * ```
     * @param context Context for the current turn of the conversation with the user.
     * @param state A state object that was previously initialized by a call to [begin()](#begin).
     */
    continue(context, state) {
        return __awaiter(this, void 0, void 0, function* () {
            // Create empty dialog set and add ourselves to it
            const dialogs = new dialogSet_1.DialogSet();
            dialogs.add('dialog', this);
            // Continue the dialog
            const dc = new dialogContext_1.DialogContext(dialogs, context, state);
            return yield dc.continue();
        });
    }
}
/** Signals the end of a turn by a dialog method or waterfall/sequence step.  */
Dialog.EndOfTurn = { hasActive: true, hasResult: false };
exports.Dialog = Dialog;
//# sourceMappingURL=dialog.js.map