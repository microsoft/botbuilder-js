"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dialogSet_1 = require("./dialogSet");
/**
 * :package: **botbuilder-dialogs**
 *
 * Base class for all dialogs.
 *
 * The `Control` and `CompositeControl` classes are very similar in that they both add `begin()`
 * and `continue()` methods which simplify consuming the control from a non-dialog based bot. The
 * primary difference between the two classes is that the `CompositeControl` class is designed to
 * bridge one `DialogSet` to another where the `Control` class assumes that the derived dialog can
 * be used in complete isolation without the need for any other supporting dialogs.
 * @param C The type of `TurnContext` being passed around. This simply lets the typing information for any context extensions flow through to dialogs and waterfall steps.
 * @param R (Optional) type of result that's expected to be returned by the control.
 * @param O (Optional) options that can be passed into the [begin()](#begin) method.
 */
class Dialog {
    /**
     * Starts the control. Depending on the control, its possible for the control to finish
     * immediately so it's advised to check the result object returned by `begin()` and ensure that
     * the control is still active before continuing.
     *
     * **Usage Example:**
     *
     * ```JavaScript
     * const state = {};
     * const result = await control.begin(context, state);
     * if (!result.active) {
     *     const value = result.result;
     * }
     * ```
     * @param context Context for the current turn of the conversation with the user.
     * @param state A state object that the control will use to persist its current state. This should be an empty object which the control will populate. The bot should persist this with its other conversation state for as long as the control is still active.
     * @param options (Optional) additional options supported by the control.
     */
    begin(context, state, options) {
        // Create empty dialog set and ourselves to it
        const dialogs = new dialogSet_1.DialogSet();
        dialogs.add('dialog', this);
        // Start the control
        const cdc = dialogs.createContext(context, state);
        return cdc.begin('dialog', options)
            .then(() => cdc.dialogResult);
    }
    /**
     * Passes a users reply to the control for further processing. The bot should keep calling
     * `continue()` for future turns until the control returns a result with `Active == false`.
     * To cancel or interrupt the prompt simply delete the `state` object being persisted.
     *
     * **Usage Example:**
     *
     * ```JavaScript
     * const result = await control.continue(context, state);
     * if (!result.active) {
     *     const value = result.result;
     * }
     * ```
     * @param context Context for the current turn of the conversation with the user.
     * @param state A state object that was previously initialized by a call to [begin()](#begin).
     */
    continue(context, state) {
        // Create empty dialog set and ourselves to it
        const dialogs = new dialogSet_1.DialogSet();
        dialogs.add('dialog', this);
        // Continue the control
        const cdc = dialogs.createContext(context, state);
        return cdc.continue()
            .then(() => cdc.dialogResult);
    }
}
exports.Dialog = Dialog;
//# sourceMappingURL=dialog.js.map