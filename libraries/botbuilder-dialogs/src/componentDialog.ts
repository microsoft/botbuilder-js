/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext } from 'botbuilder-core';
import { Dialog, DialogInstance, DialogReason, DialogTurnResult } from './dialog';
import { DialogContext, DialogState } from './dialogContext';
import { DialogSet } from './dialogSet';

const PERSISTED_DIALOG_STATE: string = 'dialogs';

/**
 * The `ComponentDialog` class lets you break your bots logic up into components that can be added
 * as a dialog to other dialog sets within your bots project or exported and used in other bot
 * projects.
 * @param R (Optional) type of result that's expected to be returned by the dialog.
 * @param O (Optional) options that can be passed into the begin() method.
 */
export class ComponentDialog<R = any, O = {}> extends Dialog {
    protected initialDialogId: string;
    private dialogs: DialogSet = new DialogSet(null);

    public async dialogBegin(dc: DialogContext, options?: any): Promise<DialogTurnResult<R>> {
        // Start the inner dialog.
        const dialogState: DialogState = { dialogStack: [] };
        dc.activeDialog.state[PERSISTED_DIALOG_STATE] = dialogState;
        const cdc: DialogContext = new DialogContext(this.dialogs, dc.context, dialogState);
        const turnResult: DialogTurnResult<any> = await this.onDialogBegin(cdc, options);

        // Check for end of inner dialog
        if (turnResult.hasResult) {
            // Return result to calling dialog
            return await dc.end(turnResult.result);
        } else {
            // Just signal end of turn
            return Dialog.EndOfTurn;
        }
    }

    public async dialogContinue(dc: DialogContext): Promise<DialogTurnResult<R>> {
        // Continue execution of inner dialog.
        const dialogState: any = dc.activeDialog.state[PERSISTED_DIALOG_STATE];
        const cdc: DialogContext = new DialogContext(this.dialogs, dc.context, dialogState);
        const turnResult: DialogTurnResult<any> = await this.onDialogContinue(cdc);

        // Check for end of inner dialog
        if (turnResult.hasResult) {
            // Return result to calling dialog
            return await dc.end(turnResult.result);
        } else {
            // Just signal end of turn
            return Dialog.EndOfTurn;
        }
    }

    public async dialogResume(dc: DialogContext, reason: DialogReason, result?: any): Promise<DialogTurnResult> {
        // Containers are typically leaf nodes on the stack but the dev is free to push other dialogs
        // on top of the stack which will result in the container receiving an unexpected call to
        // dialogResume() when the pushed on dialog ends.
        // To avoid the container prematurely ending we need to implement this method and simply
        // ask our inner dialog stack to re-prompt.
        await this.dialogReprompt(dc.context, dc.activeDialog);

        return Dialog.EndOfTurn;
    }

    public async dialogReprompt(context: TurnContext, instance: DialogInstance): Promise<void> {
        // Delegate to inner dialog.
        const dialogState: any = instance.state[PERSISTED_DIALOG_STATE];
        const cdc: DialogContext = new DialogContext(this.dialogs, context, dialogState);
        await this.onDialogReprompt(cdc);
    }

    public async dialogEnd(context: TurnContext, instance: DialogInstance, reason: DialogReason): Promise<void> {
        // Notify inner dialog
        const dialogState: any = instance.state[PERSISTED_DIALOG_STATE];
        const cdc: DialogContext = new DialogContext(this.dialogs, context, dialogState);
        await this.onDialogEnd(cdc, reason);
    }

    protected addDialog<T extends Dialog>(dialog: T): T {
        this.dialogs.add(dialog);
        if (this.initialDialogId === undefined) { this.initialDialogId = dialog.id; }

        return dialog;
    }

    protected onDialogBegin(dc: DialogContext, options?: any): Promise<DialogTurnResult> {
        return dc.begin(this.initialDialogId, options);
    }

    protected async onDialogEnd(dc: DialogContext, reason: DialogReason): Promise<void> {
        if (reason === DialogReason.cancelCalled) {
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
