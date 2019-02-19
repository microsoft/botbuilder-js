/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog, DialogTurnResult, DialogConfiguration, DialogContext } from 'botbuilder-dialogs';

export interface CallDialogConfiguration extends DialogConfiguration {
    /**
     * (Optional) static options to pass to called dialog.
     * 
     * @remarks
     * These options will be merged with any dynamic options configured as 
     * [inputBindings](#inputbindings).
     */
    options?: object;

    /**
     * (Optional) data binds the called dialogs input & output to the given state property.
     * 
     * @remarks
     * The bound properties current value will be passed to the called dialog as part of its 
     * options and will be accessible within the dialog via `dialog.options.value`. The result
     * returned from the called dialog will then be copied to the bound property.
     */
    property?: string;
}

export class CallDialog<O extends object = {}> extends Dialog<O> {

    constructor(dialogId?: string) {
        super(dialogId);
        this.outputBinding = 'dialog.lastResult';
    }

    protected onComputeID(): string {
        return `call(${this.dialogId}, ${this.bindingPath()})`;
    }

    /**
     * ID of the dialog to call.
     */
    public dialogId: string;

    /**
     * (Optional) static options to pass to the called dialog.
     * 
     * @remarks
     * These options will be merged with any dynamic options configured as 
     * [inputBindings](#inputbindings).
     */
    public options?: object;

    /**
     * (Optional) data binds the called dialogs input & output to the given property.
     * 
     * @remarks
     * The bound properties current value will be passed to the called dialog as part of its 
     * options and will be accessible within the dialog via `dialog.options.value`. The result
     * returned from the called dialog will then be copied to the bound property.
     */
    public set property(value: string) {
        this.inputBindings['value'] = value;
        this.outputBinding = value;
    }

    public get property(): string {
       return this.inputBindings['value']; 
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        options = Object.assign({}, options, this.options);
        return await dc.beginDialog(this.dialogId, options);
    }

    public static create(dialogId: string, config?: CallDialogConfiguration): CallDialog {
        const dialog = new CallDialog();
        dialog.dialogId = dialogId;
        if (config) {
            if (config.options) { dialog.options = config.options }
            if (config.property) { dialog.property = config.property }
            Dialog.configure(dialog, config);
        }
        return dialog;
    }
}