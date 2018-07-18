/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext } from 'botbuilder';
import { DialogContext } from './dialogContext';
import { DialogSet } from './dialogSet';
export declare abstract class RootDialogContainer {
    /** The containers dialog set. */
    protected readonly dialogs: DialogSet;
    continue(context: TurnContext, state: object): Promise<void>;
    protected onConversationBegin(dc: DialogContext): Promise<void>;
    protected onInterruption(dc: DialogContext): Promise<void>;
    protected onFallback(dc: DialogContext): Promise<void>;
    protected onConversationEnd(dc: DialogContext): Promise<void>;
}
