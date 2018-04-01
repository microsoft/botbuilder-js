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
/**
 *
 */
export declare abstract class Control<R = any, O = {}, C extends TurnContext = TurnContext> implements Dialog<C> {
    protected defaultOptions: O;
    /**
     * Creates a new Control instance.
     * @param defaultOptions (Optional) set of default options that should be passed to controls root dialog. These will be merged with arguments passed in by the caller.
     */
    constructor(defaultOptions?: O);
    begin(context: C, state: object, options?: O): Promise<DialogResult<R>>;
    continue(context: C, state: object): Promise<DialogResult<R>>;
    abstract dialogBegin(dc: DialogContext<C>, dialogArgs?: any): Promise<any>;
}
