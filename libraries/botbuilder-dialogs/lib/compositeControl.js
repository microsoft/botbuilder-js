"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 */
class CompositeControl {
    /**
     * Creates a new CompositeControl instance.
     * @param dialogs Controls dialog set.
     * @param dialogId ID of the root dialog that should be started anytime the control is started.
     * @param defaultOptions (Optional) set of default options that should be passed to controls root dialog. These will be merged with arguments passed in by the caller.
     */
    constructor(dialogs, dialogId, defaultOptions) {
        this.dialogs = dialogs;
        this.dialogId = dialogId;
        this.defaultOptions = defaultOptions;
    }
    begin(context, state, options) {
        const cdc = this.dialogs.createContext(context, state);
        return cdc.begin(this.dialogId, Object.assign({}, this.defaultOptions, options))
            .then(() => cdc.dialogResult);
    }
    continue(context, state) {
        const cdc = this.dialogs.createContext(context, state);
        return cdc.continue()
            .then(() => cdc.dialogResult);
    }
    dialogBegin(dc, dialogArgs) {
        // Start the controls entry point dialog. 
        const cdc = this.dialogs.createContext(dc.context, dc.instance.state);
        return cdc.begin(this.dialogId, Object.assign({}, this.defaultOptions, dialogArgs)).then(() => {
            // End if the controls dialog ends.
            if (!cdc.dialogResult.active) {
                return dc.end(cdc.dialogResult.result);
            }
        });
    }
    dialogContinue(dc) {
        // Continue controls dialog stack.
        const cdc = this.dialogs.createContext(dc.context, dc.instance.state);
        return cdc.continue().then(() => {
            // End if the controls dialog ends.
            if (!cdc.dialogResult.active) {
                return dc.end(cdc.dialogResult.result);
            }
        });
    }
}
exports.CompositeControl = CompositeControl;
//# sourceMappingURL=compositeControl.js.map