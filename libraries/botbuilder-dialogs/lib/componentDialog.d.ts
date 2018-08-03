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
/**
 * The `ComponentDialog` class lets you break your bots logic up into components that can be added
 * as a dialog to other dialog sets within your bots project or exported and used in other bot
 * projects.
 * @param R (Optional) type of result that's expected to be returned by the dialog.
 * @param O (Optional) options that can be passed into the begin() method.
 */
export declare class ComponentDialog<R = any, O = {}> extends Dialog {
    private dialogs;
    protected initialDialogId: string;
    addDialog<T extends Dialog>(dialog: T): T;
    dialogBegin(dc: DialogContext, dialogArgs?: any): Promise<DialogTurnResult<R>>;
    dialogEnd(context: TurnContext, instance: DialogInstance, reason: DialogEndReason): Promise<void>;
    dialogContinue(dc: DialogContext): Promise<DialogTurnResult<R>>;
    dialogReprompt(context: TurnContext, instance: DialogInstance): Promise<void>;
    dialogResume(dc: DialogContext, result?: any): Promise<DialogTurnResult>;
    protected onDialogBegin(dc: DialogContext, dialogArgs?: any): Promise<DialogTurnResult>;
    protected onDialogEnd(dc: DialogContext, reason: DialogEndReason): Promise<void>;
    protected onDialogContinue(dc: DialogContext): Promise<DialogTurnResult>;
    protected onDialogReprompt(dc: DialogContext): Promise<void>;
}
