/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog, DialogTurnResult, DialogConfiguration, DialogContext, DialogReason } from 'botbuilder-dialogs';

export interface BeginDialogConfiguration extends DialogConfiguration {
    /**
     * ID of the dialog to call.
     */
    dialogIdToCall?: string;

    /**
     * (Optional) static options to pass to called dialog.
     */
    options?: object;
}

export class BeginDialog<O extends object = {}> extends Dialog<O> {

    /**
     * Creates a new `BeginDialog` instance.
     * @param dialogIdToCall ID of the dialog to call.
     * @param options (Optional) static options to pass the called dialog.
     */
    constructor();
    constructor(dialogIdToCall?: string, options?: O) {
        super();
        if (dialogIdToCall) { this.dialogIdToCall = dialogIdToCall }
        if (options) { this.options = options }
    }

    protected onComputeID(): string {
        return `BeginDialog[${this.dialogIdToCall}]`;
    }

    public configure(config: BeginDialogConfiguration): this {
        return super.configure(config);
    }

    /**
     * ID of the dialog to call.
     */
    public dialogIdToCall: string;

    /**
     * (Optional) static options to pass to the called dialog.
     */
    public options?: object;

    /**
     * (Optional) property path to store the dialog result in.
     */
    public resultProperty?: string;

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        options = Object.assign({}, options, this.options);
        return await dc.beginDialog(this.dialogIdToCall, options);
    }

    public async resumeDialog(dc: DialogContext, reason: DialogReason, result: any = null): Promise<DialogTurnResult> {
        if (this.resultProperty != null) {
            dc.state.setValue(this.resultProperty, result);
        }
        return await dc.endDialog(result);
    }
}