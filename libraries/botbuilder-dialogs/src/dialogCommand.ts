/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog, DialogTurnResult } from './dialog';
import { DialogContext } from './dialogContext';

export abstract class DialogCommand<O extends object = {}> extends Dialog<O> {
    protected abstract onRunCommand(dc: DialogContext): Promise<DialogTurnResult>;

    public beginDialog(dc: DialogContext): Promise<DialogTurnResult> {
        return this.onRunCommand(dc);
    }

    protected async endParentDialog(dc: DialogContext, result?: any): Promise<DialogTurnResult> {
        dc.stack.pop();
        return await dc.endDialog(result);
    }    

    protected async replaceParentDialog(dc: DialogContext, dialogId: string, options?: object): Promise<DialogTurnResult> {
        dc.stack.pop();
        return await dc.replaceDialog(dialogId, options);
    }

    protected async cancelAllParentDialogs(dc: DialogContext): Promise<DialogTurnResult> {
        dc.stack.pop();
        return await dc.cancelAllDialogs();
    }
}