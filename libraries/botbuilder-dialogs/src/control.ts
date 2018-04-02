/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Promiseable, TurnContext } from 'botbuilder';
import { Dialog, DialogInstance } from './dialog';
import { DialogContext, DialogResult } from './dialogContext';
import { DialogSet } from './dialogSet';

/**
 * 
 */
export abstract class Control<R = any, O = {}, C extends TurnContext = TurnContext> implements Dialog<C> {

    /**
     * Creates a new Control instance.
     * @param defaultOptions (Optional) set of default options that should be passed to controls root dialog. These will be merged with arguments passed in by the caller.
     */
    constructor(protected defaultOptions?: O) { }

    public begin(context: C, state: object, options?: O): Promise<DialogResult<R>> {
        // Create empty dialog set and ourselves to it
        const dialogs = new DialogSet();
        dialogs.add('control', this);

        // Start the control
        const cdc = dialogs.createContext(context, state);
        return cdc.begin('control', Object.assign({}, this.defaultOptions, options));
    }

    public continue(context: C, state: object): Promise<DialogResult<R>> {
        // Create empty dialog set and ourselves to it
        const dialogs = new DialogSet();
        dialogs.add('control', this);

        // Continue the control
        const cdc = dialogs.createContext(context, state);
        return cdc.continue();         
    }

    abstract dialogBegin(dc: DialogContext<C>, dialogArgs?: any): Promise<any>;
}
