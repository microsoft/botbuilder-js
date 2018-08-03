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
const dialogContext_1 = require("./dialogContext");
const dialogSet_1 = require("./dialogSet");
/**
 * The `ComponentDialog` class lets you break your bots logic up into components that can be added
 * as a dialog to other dialog sets within your bots project or exported and used in other bot
 * projects.
 * @param R (Optional) type of result that's expected to be returned by the dialog.
 * @param O (Optional) options that can be passed into the begin() method.
 */
class ComponentDialog extends dialog_1.Dialog {
    constructor() {
        super(...arguments);
        this.dialogs = new dialogSet_1.DialogSet();
    }
    addDialog(dialog) {
        this.dialogs.add(dialog);
        if (this.initialDialogId === undefined) {
            this.initialDialogId = dialog.id;
        }
        return dialog;
    }
    dialogBegin(dc, dialogArgs) {
        return __awaiter(this, void 0, void 0, function* () {
            // Start the inner dialog.
            const cdc = new dialogContext_1.DialogContext(this.dialogs, dc.context, dc.activeDialog.state);
            const turnResult = yield this.onDialogBegin(dc, dialogArgs);
            // Check for end of inner dialog 
            if (turnResult.hasResult) {
                // Return result to calling dialog
                return yield dc.end(turnResult.result);
            }
            else {
                // Just signal end of turn
                return dialog_1.Dialog.EndOfTurn;
            }
        });
    }
    dialogEnd(context, instance, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            // Notify inner dialog
            const cdc = new dialogContext_1.DialogContext(this.dialogs, context, instance.state);
            yield this.onDialogEnd(cdc, reason);
        });
    }
    dialogContinue(dc) {
        return __awaiter(this, void 0, void 0, function* () {
            // Continue execution of inner dialog.
            const cdc = new dialogContext_1.DialogContext(this.dialogs, dc.context, dc.activeDialog.state);
            const turnResult = yield this.onDialogContinue(dc);
            // Check for end of inner dialog 
            if (turnResult.hasResult) {
                // Return result to calling dialog
                return yield dc.end(turnResult.result);
            }
            else {
                // Just signal end of turn
                return dialog_1.Dialog.EndOfTurn;
            }
        });
    }
    dialogReprompt(context, instance) {
        return __awaiter(this, void 0, void 0, function* () {
            // Delegate to inner dialog.
            const cdc = new dialogContext_1.DialogContext(this.dialogs, context, instance.state);
            yield this.onDialogReprompt(cdc);
        });
    }
    dialogResume(dc, result) {
        return __awaiter(this, void 0, void 0, function* () {
            // Containers are typically leaf nodes on the stack but the dev is free to push other dialogs
            // on top of the stack which will result in the container receiving an unexpected call to
            // dialogResume() when the pushed on dialog ends. 
            // To avoid the container prematurely ending we need to implement this method and simply 
            // ask our inner dialog stack to re-prompt.
            yield this.dialogReprompt(dc.context, dc.activeDialog);
            return dialog_1.Dialog.EndOfTurn;
        });
    }
    onDialogBegin(dc, dialogArgs) {
        return dc.begin(this.initialDialogId, dialogArgs);
    }
    onDialogEnd(dc, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            if (reason === dialog_1.DialogEndReason.cancelled) {
                yield dc.cancelAll();
            }
        });
    }
    onDialogContinue(dc) {
        return dc.continue();
    }
    onDialogReprompt(dc) {
        return dc.reprompt();
    }
}
exports.ComponentDialog = ComponentDialog;
//# sourceMappingURL=componentDialog.js.map