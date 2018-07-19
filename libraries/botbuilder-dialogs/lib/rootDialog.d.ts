/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext } from '../../botbuilder/lib';
import { Dialog, DialogContainer } from './dialog';
import { DialogContext } from './dialogContext';
export declare abstract class RootDialog implements DialogContainer {
    readonly id: string;
    private dialogs;
    constructor(id?: string);
    readonly parent: any;
    add<T extends Dialog>(dialog: T): T;
    createContext(context: TurnContext, state: object): Promise<DialogContext>;
    find<T extends Dialog = Dialog>(dialogId: string): T | undefined;
    dispatch(context: TurnContext, state: object): Promise<void>;
    protected onConversationBegin(dc: DialogContext): Promise<void>;
    protected onInterruption(dc: DialogContext): Promise<void>;
    protected onFallback(dc: DialogContext): Promise<void>;
    protected onConversationEnd(dc: DialogContext): Promise<void>;
}
