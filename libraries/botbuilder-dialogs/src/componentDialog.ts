/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext } from 'botbuilder-core';
import { Dialog, DialogInstance, DialogReason, DialogTurnResult, DialogTurnStatus } from './dialog';
import { DialogContext, DialogState } from './dialogContext';
import { DialogSet } from './dialogSet';

const PERSISTED_DIALOG_STATE: string = 'dialogs';

/**
 * The `ComponentDialog` class lets you break your bots logic up into components that can be added
 * as a dialog to other dialog sets within your bots project or exported and used in other bot
 * projects.
 * @param O (Optional) options that can be passed into the begin() method.
 */
export class ComponentDialog<O extends object = {}> extends Dialog<O> {
    protected initialDialogId: string;
    private dialogs: DialogSet = new DialogSet(null);

    public async dialogBegin(outerDC: DialogContext, options?: O): Promise<DialogTurnResult> {
        // Start the inner dialog.
        const dialogState: DialogState = { dialogStack: [] };
        outerDC.activeDialog.state[PERSISTED_DIALOG_STATE] = dialogState;
        const innerDC: DialogContext = new DialogContext(this.dialogs, outerDC.context, dialogState);
        const turnResult: DialogTurnResult<any> = await this.onDialogBegin(innerDC, options);

        // Check for end of inner dialog
        if (turnResult.status !== DialogTurnStatus.waiting) {
            // Return result to calling dialog
            return await this.endComponent(outerDC, turnResult.result);
        } else {
            // Just signal end of turn
            return Dialog.EndOfTurn;
        }
    }

    public async dialogContinue(outerDC: DialogContext): Promise<DialogTurnResult> {
        // Continue execution of inner dialog.
        const dialogState: any = outerDC.activeDialog.state[PERSISTED_DIALOG_STATE];
        const innerDC: DialogContext = new DialogContext(this.dialogs, outerDC.context, dialogState);
        const turnResult: DialogTurnResult<any> = await this.onDialogContinue(innerDC);

        // Check for end of inner dialog
        if (turnResult.status !== DialogTurnStatus.waiting) {
            // Return result to calling dialog
            return await this.endComponent(outerDC, turnResult.result);
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
        // Forward to inner dialogs
        const dialogState: any = instance.state[PERSISTED_DIALOG_STATE];
        const innerDC: DialogContext = new DialogContext(this.dialogs, context, dialogState);
        await innerDC.reprompt();

        // Notify component.
        await this.onDialogReprompt(context, instance);
    }

    public async dialogEnd(context: TurnContext, instance: DialogInstance, reason: DialogReason): Promise<void> {
        // Forward cancel to inner dialogs
        if (reason === DialogReason.cancelCalled) {
            const dialogState: any = instance.state[PERSISTED_DIALOG_STATE];
            const innerDC: DialogContext = new DialogContext(this.dialogs, context, dialogState);
            await innerDC.cancelAll();
        } 

        // Notify component
        await this.onDialogEnd(context, instance, reason);
    }

    protected addDialog<T extends Dialog>(dialog: T): T {
        this.dialogs.add(dialog);
        if (this.initialDialogId === undefined) { this.initialDialogId = dialog.id; }

        return dialog;
    }

    protected onDialogBegin(innerDC: DialogContext, options?: O): Promise<DialogTurnResult> {
        return innerDC.begin(this.initialDialogId, options);
    }

    protected onDialogContinue(innerDC: DialogContext): Promise<DialogTurnResult> {
        return innerDC.continue();
    }

    protected onDialogEnd(context: TurnContext, instance: DialogInstance, reason: DialogReason): Promise<void> {
        return Promise.resolve();
    }

    protected onDialogReprompt(context: TurnContext, instance: DialogInstance): Promise<void> {
        return Promise.resolve();
    }

    protected endComponent(outerDC: DialogContext, result: any): Promise<DialogTurnResult> {
        return outerDC.end(result);
    }
}
