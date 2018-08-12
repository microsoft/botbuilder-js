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
var DialogReason;
(function (DialogReason) {
    /** A dialog is being started through a call to `DialogContext.begin()`. */
    DialogReason[DialogReason["beginCalled"] = 0] = "beginCalled";
    /** A dialog is being continued through a call to `DialogContext.continue()`. */
    DialogReason[DialogReason["continueCalled"] = 1] = "continueCalled";
    /** A dialog ended normally through a call to `DialogContext.end()`. */
    DialogReason[DialogReason["endCalled"] = 2] = "endCalled";
    /** A dialog is ending because its being replaced through a call to `DialogContext.replace()`. */
    DialogReason[DialogReason["replaceCalled"] = 3] = "replaceCalled";
    /** A dialog was cancelled as part of a call to `DialogContext.cancelAll()`. */
    DialogReason[DialogReason["cancelCalled"] = 4] = "cancelCalled";
    /** A step was advanced through a call to `WaterfallStepContext.next()`. */
    DialogReason[DialogReason["nextCalled"] = 5] = "nextCalled";
})(DialogReason = exports.DialogReason || (exports.DialogReason = {}));
/**
 * Base class for all dialogs.
 */
class Dialog {
    constructor(dialogId) {
        this.id = dialogId;
    }
    /**
     * (Optional) method called when an instance of the dialog is the active dialog and the user
     * replies with a new activity. The dialog will generally continue to receive the users replies
     * until it calls `DialogContext.end()`, `DialogContext.begin()`, or `DialogContext.prompt()`.
     *
     * If this method is NOT implemented then the dialog will be automatically ended when the user
     * replies.
     * @param dc The dialog context for the current turn of conversation.
     */
    dialogContinue(dc) {
        return __awaiter(this, void 0, void 0, function* () {
            // By default just end the current dialog.
            return dc.end();
        });
    }
    /**
     * (Optional) method called when an instance of the dialog is being returned to from another
     * dialog that was started by the current instance using `DialogContext.begin()` or
     * `DialogContext.prompt()`.
     *
     * If this method is NOT implemented then the dialog will be automatically ended with a call
     * to `DialogContext.end()`. Any result passed from the called dialog will be passed to the
     * active dialogs parent.
     * @param dc The dialog context for the current turn of conversation.
     * @param reason The reason the dialog is being resumed. This will typically be a value of `DialogReason.endCalled`.
     * @param result (Optional) value returned from the dialog that was called. The type of the value returned is dependant on the dialog that was called.
     */
    dialogResume(dc, reason, result) {
        return __awaiter(this, void 0, void 0, function* () {
            // By default just end the current dialog and return result to parent.
            return dc.end(result);
        });
    }
    /**
     * (Optional) method called when the dialog has been requested to re-prompt the user for input.
     * @param context Context for the current turn of conversation.
     * @param instance The instance of the current dialog.
     */
    dialogReprompt(context, instance) {
        return __awaiter(this, void 0, void 0, function* () {
            // No-op by default
        });
    }
    /**
     * (Optional) method called when the dialog is ending.
     * @param context Context for the current turn of conversation.
     * @param instance The instance of the current dialog.
     * @param reason The reason the dialog is ending.
     */
    dialogEnd(context, instance, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            // No-op by default
        });
    }
}
/** Signals the end of a turn by a dialog method or waterfall/sequence step.  */
Dialog.EndOfTurn = { hasActive: true, hasResult: false };
exports.Dialog = Dialog;
//# sourceMappingURL=dialog.js.map