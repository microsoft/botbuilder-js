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

    public async beginDialog(outerDC: DialogContext, options?: O): Promise<DialogTurnResult> {
        // Start the inner dialog.
        const dialogState: DialogState = { dialogStack: [] };
        outerDC.activeDialog.state[PERSISTED_DIALOG_STATE] = dialogState;
        const innerDC: DialogContext = new DialogContext(this.dialogs, outerDC.context, dialogState);
        const turnResult: DialogTurnResult<any> = await this.onBeginDialog(innerDC, options);

        // Check for end of inner dialog
        if (turnResult.status !== DialogTurnStatus.waiting) {
            // Return result to calling dialog
            return await this.endComponent(outerDC, turnResult.result);
        } else {
            // Just signal end of turn
            return Dialog.EndOfTurn;
        }
    }

    public async continueDialog(outerDC: DialogContext): Promise<DialogTurnResult> {
        // Continue execution of inner dialog.
        const dialogState: any = outerDC.activeDialog.state[PERSISTED_DIALOG_STATE];
        const innerDC: DialogContext = new DialogContext(this.dialogs, outerDC.context, dialogState);
        const turnResult: DialogTurnResult<any> = await this.onContinueDialog(innerDC);

        // Check for end of inner dialog
        if (turnResult.status !== DialogTurnStatus.waiting) {
            // Return result to calling dialog
            return await this.endComponent(outerDC, turnResult.result);
        } else {
            // Just signal end of turn
            return Dialog.EndOfTurn;
        }
    }

    public async resumeDialog(dc: DialogContext, reason: DialogReason, result?: any): Promise<DialogTurnResult> {
        // Containers are typically leaf nodes on the stack but the dev is free to push other dialogs
        // on top of the stack which will result in the container receiving an unexpected call to
        // resumeDialog() when the pushed on dialog ends.
        // To avoid the container prematurely ending we need to implement this method and simply
        // ask our inner dialog stack to re-prompt.
        await this.repromptDialog(dc.context, dc.activeDialog);

        return Dialog.EndOfTurn;
    }

    public async repromptDialog(context: TurnContext, instance: DialogInstance): Promise<void> {
        // Forward to inner dialogs
        const dialogState: any = instance.state[PERSISTED_DIALOG_STATE];
        const innerDC: DialogContext = new DialogContext(this.dialogs, context, dialogState);
        await innerDC.repromptDialog();

        // Notify component.
        await this.onRepromptDialog(context, instance);
    }

    public async endDialog(context: TurnContext, instance: DialogInstance, reason: DialogReason): Promise<void> {
        // Forward cancel to inner dialogs
        if (reason === DialogReason.cancelCalled) {
            const dialogState: any = instance.state[PERSISTED_DIALOG_STATE];
            const innerDC: DialogContext = new DialogContext(this.dialogs, context, dialogState);
            await innerDC.cancelAllDialogs();
        }

        // Notify component
        await this.onEndDialog(context, instance, reason);
    }

    public addDialog<T extends Dialog>(dialog: T): ComponentDialog<O> {
        this.dialogs.add(dialog);
        if (this.initialDialogId === undefined) { this.initialDialogId = dialog.id; }

        return this;
    }

    /**
     * Finds a dialog that was previously added to the set using [add()](#add).
     *
     * @remarks
     * This example finds a dialog named "greeting":
     *
     * ```JavaScript
     * const dialog = dialogs.find('greeting');
     * ```
     * @param dialogId ID of the dialog/prompt to lookup.
     */
    public findDialog(dialogId: string): Dialog | undefined {
        return this.dialogs.find(dialogId);
    }


    protected onBeginDialog(innerDC: DialogContext, options?: O): Promise<DialogTurnResult> {
        return innerDC.beginDialog(this.initialDialogId, options);
    }

    protected onContinueDialog(innerDC: DialogContext): Promise<DialogTurnResult> {
        return innerDC.continueDialog();
    }

    protected onEndDialog(context: TurnContext, instance: DialogInstance, reason: DialogReason): Promise<void> {
        return Promise.resolve();
    }

    protected onRepromptDialog(context: TurnContext, instance: DialogInstance): Promise<void> {
        return Promise.resolve();
    }

    protected endComponent(outerDC: DialogContext, result: any): Promise<DialogTurnResult> {
        return outerDC.endDialog(result);
    }
}
