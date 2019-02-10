/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogCommand } from '../dialogCommand';
import { DialogContext } from '../dialogContext';
import { DialogTurnResult, DialogConfiguration, Dialog } from '../dialog';

export interface RepeatDialogConfiguration extends DialogConfiguration {
    /**
     * (Optional) static options to pass into the dialog when it's repeated.
     * 
     * @remarks
     * These options will be merged with any options that were originally passed into the dialog
     * or options that were dynamically configured using [inputBindings](#inputbindings).
     */
    options?: object;
}

export class RepeatDialog extends DialogCommand {

    protected onComputeID(): string {
        return `repeat(${this.bindingPath()})`;
    }

    /**
     * (Optional) static options to pass into the dialog when it's repeated.
     * 
     * @remarks
     * These options will be merged with any options that were originally passed into the dialog
     * or options that were dynamically configured using [inputBindings](#inputbindings).
     */
    public options?: object;

    protected async onRunCommand(dc: DialogContext, options?: object): Promise<DialogTurnResult> {
        const originalOptions = dc.state.dialog.get('options');
        options = Object.assign({}, originalOptions, options, this.options);
        return await this.repeatParentDialog(dc, options);
    }

    static create(config?: RepeatDialogConfiguration): RepeatDialog {
        const dialog = new RepeatDialog();
        if (config) {
            if (config.options) { dialog.options = config.options }
            Dialog.configure(dialog, config);
        }
        return dialog;
    }
}