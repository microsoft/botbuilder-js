/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogConfiguration, Dialog, DialogCommand, DialogContext } from 'botbuilder-dialogs';

export interface GotoDialogConfiguration extends DialogConfiguration {
    /**
     * ID of the dialog to goto.
     */
    dialogId: string;

    /**
     * (Optional) static options to pass to the goto dialog.
     * 
     * @remarks
     * These options will be merged with any dynamic options configured as 
     * [inputBindings](#inputbindings).
     */
    options?: object;
}

export class GotoDialog extends DialogCommand {

    protected onComputeID(): string {
        return `goto(${this.dialogId})`;
    }

    /**
     * ID of the dialog to goto.
     */
    public dialogId: string;

    /**
     * (Optional) static options to pass to the goto dialog.
     * 
     * @remarks
     * These options will be merged with any dynamic options configured as 
     * [inputBindings](#inputbindings).
     */
    public options?: object;

    protected async onRunCommand(dc: DialogContext, options?: object): Promise<DialogTurnResult> {
        options = Object.assign({}, options, this.options);
        return await this.replaceParentDialog(dc, this.dialogId, options);
    }

    static create(config?: GotoDialogConfiguration): GotoDialog {
        const dialog = new GotoDialog();
        if (config) {
            if (config.dialogId) { dialog.dialogId = config.dialogId }
            if (config.options) { dialog.options = config.options }
            Dialog.configure(dialog, config);
        }
        return dialog;
    }
}