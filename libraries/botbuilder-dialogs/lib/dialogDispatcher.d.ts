/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext } from 'botbuilder';
import { Dialog, DialogContainer } from './dialog';
import { DialogContext } from './dialogContext';
export declare abstract class DialogDispatcher implements DialogContainer {
    readonly id: string;
    private dialogs;
    constructor(id?: string);
    readonly parent: any;
    add<T extends Dialog>(dialog: T): T;
    createContext(context: TurnContext, state: object): Promise<DialogContext>;
    find<T extends Dialog = Dialog>(dialogId: string): T | undefined;
    dispatch(context: TurnContext, state: object): Promise<void>;
    protected onActivity(dc: DialogContext): Promise<void>;
    protected onContactRelationUpdate(dc: DialogContext): Promise<void>;
    protected onConversationBegin(dc: DialogContext): Promise<void>;
    protected onConversationEnd(dc: DialogContext): Promise<void>;
    protected onConversationUpdate(dc: DialogContext): Promise<void>;
    protected onEvent(dc: DialogContext): Promise<void>;
    protected onInvoke(dc: DialogContext): Promise<void>;
    protected onMessage(dc: DialogContext): Promise<void>;
    protected onNoResponse(dc: DialogContext): Promise<void>;
}
