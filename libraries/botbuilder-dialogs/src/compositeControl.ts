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
export class CompositeControl<R = any, O = {}, C extends TurnContext = TurnContext> implements Dialog<C> {

    /**
     * Creates a new CompositeControl instance.
     * @param dialogs Controls dialog set.
     * @param dialogId ID of the root dialog that should be started anytime the control is started.
     * @param defaultOptions (Optional) set of default options that should be passed to controls root dialog. These will be merged with arguments passed in by the caller.
     */
    constructor(protected dialogs: DialogSet<C>, protected dialogId: string, protected defaultOptions?: O) { }

    public begin(context: C, state: object, options?: O): Promise<DialogResult<R>> {
        const cdc = this.dialogs.createContext(context, state);
        return cdc.begin(this.dialogId, Object.assign({}, this.defaultOptions, options));
    }

    public continue(context: C, state: object): Promise<DialogResult<R>> {
        const cdc = this.dialogs.createContext(context, state);
        return cdc.continue();         
    }

    public dialogBegin(dc: DialogContext<C>, dialogArgs?: any): Promise<any> {
        // Start the controls entry point dialog. 
        const cdc = this.dialogs.createContext(dc.context, dc.instance.state);
        return cdc.begin(this.dialogId, Object.assign({}, this.defaultOptions, dialogArgs)).then((result) => {
            // End if the controls dialog ends.
            if (!result.active) {
                return dc.end(result.result);
            }
        });
    }

    public dialogContinue(dc: DialogContext<C>): Promise<any> {
        // Continue controls dialog stack.
        const cdc = this.dialogs.createContext(dc.context, dc.instance.state);
        return cdc.continue().then((result) => {
            // End if the controls dialog ends.
            if (!result.active) {
                return dc.end(result.result);
            }
        });
    }
}
