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
        this.popCommands(dc);
        return await dc.endDialog(result);
    }    

    protected async replaceParentDialog(dc: DialogContext, dialogId: string, options?: object): Promise<DialogTurnResult> {
        this.popCommands(dc);
        return await dc.replaceDialog(dialogId, options);
    }

    protected async cancelAllParentDialogs(dc: DialogContext): Promise<DialogTurnResult> {
        this.popCommands(dc);
        return await dc.cancelAllDialogs();
    }

    private popCommands(dc: DialogContext): void {
        // Pop all commands off the stack.
        while (dc.stack.length > 1) {
            // Commands store the index of the state they're inheriting so we can tell a command
            // by looking to see if its state of type 'number'.
            const i = dc.stack.length - 1;
            if (typeof dc.stack[i].state === 'number') {
                dc.stack.pop();
            } else {
                break;
            }
        }
    }
}