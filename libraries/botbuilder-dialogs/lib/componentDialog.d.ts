/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext } from 'botbuilder-core';
import { Dialog, DialogTurnResult, DialogReason, DialogInstance } from './dialog';
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
    dialogBegin(dc: DialogContext, options?: any): Promise<DialogTurnResult<R>>;
    dialogContinue(dc: DialogContext): Promise<DialogTurnResult<R>>;
    dialogResume(dc: DialogContext, reason: DialogReason, result?: any): Promise<DialogTurnResult>;
    dialogReprompt(context: TurnContext, instance: DialogInstance): Promise<void>;
    dialogEnd(context: TurnContext, instance: DialogInstance, reason: DialogReason): Promise<void>;
    protected initialDialogId: string;
    protected addDialog<T extends Dialog>(dialog: T): T;
    protected onDialogBegin(dc: DialogContext, options?: any): Promise<DialogTurnResult>;
    protected onDialogEnd(dc: DialogContext, reason: DialogReason): Promise<void>;
    protected onDialogContinue(dc: DialogContext): Promise<DialogTurnResult>;
    protected onDialogReprompt(dc: DialogContext): Promise<void>;
}
