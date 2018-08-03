"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DialogEndReason;
(function (DialogEndReason) {
    /** The dialog ended normally through a call to `DialogContext.end()`. */
    DialogEndReason[DialogEndReason["completed"] = 0] = "completed";
    /** The dialog was cancelled as part of a call to `DialogContext.cancelAll()`. */
    DialogEndReason[DialogEndReason["cancelled"] = 1] = "cancelled";
})(DialogEndReason = exports.DialogEndReason || (exports.DialogEndReason = {}));
/**
 * Base class for all dialogs.
 * @param R (Optional) type of result that's expected to be returned by the dialog.
 * @param O (Optional) options that can be passed into the [begin()](#begin) method.
 */
class Dialog {
    constructor(id) {
        this.id = id;
    }
}
/** Signals the end of a turn by a dialog method or waterfall/sequence step.  */
Dialog.EndOfTurn = { hasActive: true, hasResult: false };
exports.Dialog = Dialog;
//# sourceMappingURL=dialog.js.map