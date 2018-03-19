/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BotContext } from 'botbuilder';
import { Dialog } from './dialog';
import { DialogContext } from './dialogContext';
import { DialogSet } from './dialogSet';
/**
 *
 */
export declare class Control<C extends BotContext = BotContext> implements Dialog<C> {
    protected dialogs: DialogSet;
    protected dialogId: string;
    protected defaultDialogArgs: {};
    /**
     * Creates a new Control instance.
     * @param dialogs Controls dialog set.
     * @param dialogId ID of the root dialog that should be started anytime the control is started.
     * @param defaultDialogArgs (Optional) set of default args that should be passed to controls root dialog. These will be merged with arguments passed in by the caller.
     */
    constructor(dialogs: DialogSet, dialogId: string, defaultDialogArgs?: {});
    begin(dc: DialogContext<C>, dialogArgs?: any): Promise<any>;
    continue(dc: DialogContext<C>): Promise<any>;
}
