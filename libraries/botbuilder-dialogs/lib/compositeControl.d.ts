/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext } from 'botbuilder';
import { Dialog } from './dialog';
import { DialogContext, DialogResult } from './dialogContext';
import { DialogSet } from './dialogSet';
/**
 *
 */
export declare class CompositeControl<R = any, O = {}, C extends TurnContext = TurnContext> implements Dialog<C> {
    protected dialogs: DialogSet<C>;
    protected dialogId: string;
    protected defaultOptions: O;
    /**
     * Creates a new CompositeControl instance.
     * @param dialogs Controls dialog set.
     * @param dialogId ID of the root dialog that should be started anytime the control is started.
     * @param defaultOptions (Optional) set of default options that should be passed to controls root dialog. These will be merged with arguments passed in by the caller.
     */
    constructor(dialogs: DialogSet<C>, dialogId: string, defaultOptions?: O);
    begin(context: C, state: object, options?: O): Promise<DialogResult<R>>;
    continue(context: C, state: object): Promise<DialogResult<R>>;
    dialogBegin(dc: DialogContext<C>, dialogArgs?: any): Promise<any>;
    dialogContinue(dc: DialogContext<C>): Promise<any>;
}
