/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog, DialogTurnResult } from './dialog';
import { DialogContext } from './dialogContext';
import { DialogDependencies } from './dialogSet';

export abstract class DialogCommand<O extends object = {}> extends Dialog<O> implements DialogDependencies {
    protected abstract onRunCommand(dc: DialogContext, options?: O): Promise<DialogTurnResult>;

    constructor(dialogId?: string) {
        super(dialogId);
    }
    
    public getDependencies(): Dialog[] {
        return [];
    }

    public onComputeId(): string {
        return `${typeof(this)}[${this.id}]`;
    }
    
    public beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        return this.onRunCommand(dc, options);
    }

    protected async endParentDialog(dc: DialogContext, result?: any): Promise<DialogTurnResult> {
        this.popCommands(dc);
        if (dc.stack.length > 0 || !dc.parent) {
            return await dc.endDialog(result);
        } else {
            const turnResult = await dc.parent.endDialog(result);
            turnResult.parentEnded = true;
            return turnResult;
         }
    }    

    protected async replaceParentDialog(dc: DialogContext, dialogId: string, options?: object): Promise<DialogTurnResult> {
        this.popCommands(dc);
        if (dc.stack.length > 0 || !dc.parent) {
            return await dc.replaceDialog(dialogId, options);
        } else {
            const turnResult = await dc.parent.replaceDialog(dialogId, options);
            turnResult.parentEnded = true;
            return turnResult;
         }
    }

    protected async repeatParentDialog(dc: DialogContext, options?: object): Promise<DialogTurnResult> {
        this.popCommands(dc);
        if (dc.stack.length > 0 || !dc.parent) {
            return await dc.replaceDialog(dc.activeDialog.id, options);
        } else {
            const turnsResult = await dc.parent.replaceDialog(dc.parent.activeDialog.id, options);
            turnsResult.parentEnded = true;
            return turnsResult;
         }
    }

    protected async cancelAllParentDialogs(dc: DialogContext): Promise<DialogTurnResult> {
        this.popCommands(dc);
        if (dc.stack.length > 0 || !dc.parent) {
            return await dc.cancelAllDialogs();
        } else {
           const turnResult = await dc.parent.cancelAllDialogs();
           turnResult.parentEnded = true;
           return turnResult;
        }
    }

    private popCommands(dc: DialogContext): void {
        // Pop all commands off the stack.
        let i = dc.stack.length - 1; 
        while (i >= 0) {
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