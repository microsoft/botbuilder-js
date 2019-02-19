/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogCommand, DialogContext } from 'botbuilder-dialogs';

export class CancelDialog extends DialogCommand {

    protected onComputeID(): string {
        return `cancelDialog()`;
    }
    
    protected async onRunCommand(dc: DialogContext): Promise<DialogTurnResult> {
        return await this.cancelAllParentDialogs(dc);
    }
}