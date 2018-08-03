/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext } from 'botbuilder';
import { Dialog, DialogTurnResult, DialogEndReason, DialogInstance } from './dialog';
import { DialogContext } from './dialogContext';
import { DialogSet } from './dialogSet';


/**
 * The `ComponentDialog` class lets you break your bots logic up into components that can be added
 * as a dialog to other dialog sets within your bots project or exported and used in other bot 
 * projects.
 * @param R (Optional) type of result that's expected to be returned by the dialog.
 * @param O (Optional) options that can be passed into the begin() method.
 */
export class ComponentDialog<R = any, O = {}> extends Dialog {
    private dialogs = new DialogSet();
    protected initialDialogId: string;

    public addDialog<T extends Dialog>(dialog: T): T {
        this.dialogs.add(dialog);
        if (this.initialDialogId === undefined) { this.initialDialogId = dialog.id }
        return dialog;
    }

    public async dialogBegin(dc: DialogContext, dialogArgs?: any): Promise<DialogTurnResult<R>> {
        // Start the inner dialog.
        const cdc = new DialogContext(this.dialogs, dc.context, dc.activeDialog.state);
        const turnResult = await this.onDialogBegin(dc, dialogArgs);
        
        // Check for end of inner dialog 
        if (turnResult.hasResult) {
            // Return result to calling dialog
            return await dc.end(turnResult.result);
        } else {
            // Just signal end of turn
            return Dialog.EndOfTurn;
        }
    }

    public async dialogEnd(context: TurnContext, instance: DialogInstance, reason: DialogEndReason): Promise<void> {
        // Notify inner dialog
        const cdc = new DialogContext(this.dialogs, context, instance.state);
        await this.onDialogEnd(cdc, reason);
    }

    public async dialogContinue(dc: DialogContext): Promise<DialogTurnResult<R>> {
        // Continue execution of inner dialog.
        const cdc = new DialogContext(this.dialogs, dc.context, dc.activeDialog.state);
        const turnResult = await this.onDialogContinue(dc);
        
        // Check for end of inner dialog 
        if (turnResult.hasResult) {
            // Return result to calling dialog
            return await dc.end(turnResult.result);
        } else {
            // Just signal end of turn
            return Dialog.EndOfTurn;
        }
    }

    public async dialogReprompt(context: TurnContext, instance: DialogInstance): Promise<void> {
        // Delegate to inner dialog.
        const cdc = new DialogContext(this.dialogs, context, instance.state);
        await this.onDialogReprompt(cdc);
    }

    public async dialogResume(dc: DialogContext, result?: any): Promise<DialogTurnResult> {
        // Containers are typically leaf nodes on the stack but the dev is free to push other dialogs
        // on top of the stack which will result in the container receiving an unexpected call to
        // dialogResume() when the pushed on dialog ends. 
        // To avoid the container prematurely ending we need to implement this method and simply 
        // ask our inner dialog stack to re-prompt.
        await this.dialogReprompt(dc.context, dc.activeDialog);
        return Dialog.EndOfTurn;
    }

    protected onDialogBegin(dc: DialogContext, dialogArgs?: any): Promise<DialogTurnResult> {
        return dc.begin(this.initialDialogId, dialogArgs);
    }

    protected async onDialogEnd(dc: DialogContext, reason: DialogEndReason): Promise<void> {
        if (reason === DialogEndReason.cancelled) {
            await dc.cancelAll();
        }
    }

    protected onDialogContinue(dc: DialogContext): Promise<DialogTurnResult> {
        return dc.continue();
    }

    protected onDialogReprompt(dc: DialogContext): Promise<void> {
        return dc.reprompt();
    }
}
