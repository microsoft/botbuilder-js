"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 */
class Control {
    /**
     * Creates a new Control instance.
     * @param dialogs Controls dialog set.
     * @param dialogId ID of the root dialog that should be started anytime the control is started.
     * @param defaultDialogArgs (Optional) set of default args that should be passed to controls root dialog. These will be merged with arguments passed in by the caller.
     */
    constructor(dialogs, dialogId, defaultDialogArgs = {}) {
        this.dialogs = dialogs;
        this.dialogId = dialogId;
        this.defaultDialogArgs = defaultDialogArgs;
    }
    begin(dc, dialogArgs) {
        // Initialize an empty stack for the controls DialogSet.
        const instance = dc.instance;
        instance.state = [];
        // Start the controls entry point dialog. 
        const cdc = this.dialogs.createContext(dc.context, instance.state);
        return cdc.begin(this.dialogId, Object.assign({}, this.defaultDialogArgs, dialogArgs)).then((result) => {
            // End if the controls dialog ends.
            if (!result.active) {
                return dc.end(result.result);
            }
        });
    }
    continue(dc) {
        // Continue controls dialog stack.
        const instance = dc.instance;
        const cdc = this.dialogs.createContext(dc.context, instance.state);
        return cdc.continue().then((result) => {
            // End if the controls dialog ends.
            if (!result.active) {
                return dc.end(result.result);
            }
        });
    }
}
exports.Control = Control;
//# sourceMappingURL=control.js.map