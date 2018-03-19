/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Promiseable, BotContext } from 'botbuilder';
import { Dialog, DialogInstance } from './dialog';
import { DialogContext, DialogResult } from './dialogContext';
import { DialogSet } from './dialogSet';


/**
 * 
 */
export class Control<C extends BotContext = BotContext> implements Dialog<C> {

    /**
     * Creates a new Control instance.
     * @param dialogs Controls dialog set.
     * @param dialogId ID of the root dialog that should be started anytime the control is started.
     * @param defaultDialogArgs (Optional) set of default args that should be passed to controls root dialog. These will be merged with arguments passed in by the caller.
     */
    constructor(protected dialogs: DialogSet, protected dialogId: string, protected defaultDialogArgs = {}) { }

    public begin(dc: DialogContext<C>, dialogArgs?: any): Promise<any> {
        // Initialize an empty stack for the controls DialogSet.
        const instance = dc.instance as ControlInstance;
        instance.state = [];

        // Start the controls entry point dialog. 
        const cdc = this.dialogs.createContext(dc.context, instance.state);
        return cdc.begin(this.dialogId, Object.assign({}, this.defaultDialogArgs, dialogArgs)).then((result) => {
            // End if the controls dialog ends.
            if (!result.active) {
                return dc.end(result.result);
            }
        });
    }

    public continue(dc: DialogContext<C>): Promise<any> {
        // Continue controls dialog stack.
        const instance = dc.instance as ControlInstance;
        const cdc = this.dialogs.createContext(dc.context, instance.state);
        return cdc.continue().then((result) => {
            // End if the controls dialog ends.
            if (!result.active) {
                return dc.end(result.result);
            }
        });
    }
}

interface ControlInstance extends DialogInstance<DialogInstance[]> { }
