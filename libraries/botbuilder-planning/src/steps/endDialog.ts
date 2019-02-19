/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogConfiguration, Dialog, DialogCommand, DialogContext } from 'botbuilder-dialogs';

export interface EndDialogConfiguration extends DialogConfiguration {
    /**
     * (Optional) specifies an in-memory state property that should be returned to the calling
     * dialog.
     */
    resultProperty?: string;
}

export class EndDialog extends DialogCommand {

    protected onComputeID(): string {
        return `end(${this.resultProperty || ''})`;
    }

    /**
     * (Optional) specifies an in-memory state property that should be returned to the calling
     * dialog.
     */
    public resultProperty?: string;

    protected async onRunCommand(dc: DialogContext): Promise<DialogTurnResult> {
        const result = this.resultProperty ? dc.state.getValue(this.resultProperty) : undefined;
        return await this.endParentDialog(dc, result);
    }

    static create(config?: EndDialogConfiguration): EndDialog {
        const dialog = new EndDialog();
        if (config) {
            if (config.resultProperty) { dialog.resultProperty = config.resultProperty }
            Dialog.configure(dialog, config);
        }
        return dialog;
    }
}