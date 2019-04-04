/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog, DialogTurnResult, DialogConfiguration, DialogContext } from 'botbuilder-dialogs';

export interface BeginDialogConfiguration extends DialogConfiguration {
    /**
     * ID of the dialog to call.
     */
    dialogId?: string;

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

export class BeginDialog<O extends object = {}> extends Dialog<O> {

    /**
     * Creates a new `BeginDialog` instance.
     * @param dialogId ID of the dialog to call.
     * @param property (Optional) property to bind the called dialogs value to.
     * @param options (Optional) static options to pass the called dialog.
     */
    constructor();
    constructor(dialogId: string, options?: O);
    constructor(dialogId: string, property: string, options?: O)
    constructor(dialogId?: string, optionsOrProperty?: O|string, options?: O) {
        super();
        this.outputProperty = 'dialog.lastResult';

        // Process args
        if (typeof optionsOrProperty === 'object') {
            options = optionsOrProperty;
            optionsOrProperty = undefined;
        }
        if (dialogId) { this.dialogId = dialogId }
        if (typeof optionsOrProperty == 'string') { this.property = optionsOrProperty }
        if (options) { this.options = options }
    }

    protected onComputeID(): string {
        return `call[${this.hashedLabel(this.dialogId + ':' + this.bindingPath(false))}]`;
    }

    public configure(config: BeginDialogConfiguration): this {
        return super.configure(config);
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
        this.inputProperties['value'] = value;
        this.outputProperty = value;
    }

    public get property(): string {
       return this.inputProperties['value']; 
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        options = Object.assign({}, options, this.options);
        return await dc.beginDialog(this.dialogId, options);
    }
}