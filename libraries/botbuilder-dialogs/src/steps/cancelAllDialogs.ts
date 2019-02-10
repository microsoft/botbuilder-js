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

export class CancelAllDialogs extends DialogCommand {

    protected onComputeID(): string {
        return `cancelAll()`;
    }
    
    protected async onRunCommand(dc: DialogContext): Promise<DialogTurnResult> {
        return await this.cancelAllParentDialogs(dc);
    }

    static create(config?: DialogConfiguration): CancelAllDialogs {
        const dialog = new CancelAllDialogs();
        if (config) {
            Dialog.configure(dialog, config);
        }
        return dialog;
    }
}