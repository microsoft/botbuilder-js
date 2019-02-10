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
    public steps: Dialog[] = [];

    protected abstract onRunCommand(dc: DialogContext, options?: O): Promise<DialogTurnResult>;

    public beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        return this.onRunCommand(dc, options);
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
        let i = dc.stack.length - 1; 
        while (i > 0) {
            // Commands store the index of the state they're inheriting so we can tell a command
            // by looking to see if its state is of type 'number'.
            if (typeof dc.stack[i].state === 'number') {
                dc.stack.pop();
                i--;
            } else {
                break;
            }
        }
    }
}