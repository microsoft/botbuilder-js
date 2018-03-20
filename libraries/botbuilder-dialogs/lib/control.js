"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dialogSet_1 = require("./dialogSet");
/**
 *
 */
class Control {
    /**
     * Creates a new Control instance.
     * @param defaultOptions (Optional) set of default options that should be passed to controls root dialog. These will be merged with arguments passed in by the caller.
     */
    constructor(defaultOptions) {
        this.defaultOptions = defaultOptions;
    }
    begin(context, state, options) {
        // Create empty dialog set and ourselves to it
        const dialogs = new dialogSet_1.DialogSet();
        dialogs.add('control', this);
        // Start the control
        const cdc = dialogs.createContext(context, state);
        return cdc.begin('control', Object.assign({}, this.defaultOptions, options));
    }
    continue(context, state) {
        // Create empty dialog set and ourselves to it
        const dialogs = new dialogSet_1.DialogSet();
        dialogs.add('control', this);
        // Continue the control
        const cdc = dialogs.createContext(context, state);
        return cdc.continue();
    }
}
exports.Control = Control;
//# sourceMappingURL=control.js.map