"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Base class for all dialogs.
 * @param R (Optional) type of result that's expected to be returned by the dialog.
 * @param O (Optional) options that can be passed into the [begin()](#begin) method.
 */
class Dialog {
    constructor(id) {
        this.id = id;
        this._parent = undefined;
    }
    get parent() {
        return this._parent;
    }
    set parent(value) {
        if (this._parent != undefined) {
            throw new Error(`${this.id}.parent: a parent dialog container has already been assigned.`);
        }
        this._parent = value;
    }
}
/** Signals the end of a turn by a dialog method or waterfall/sequence step.  */
Dialog.EndOfTurn = { hasActive: true, hasResult: false };
exports.Dialog = Dialog;
//# sourceMappingURL=dialog.js.map