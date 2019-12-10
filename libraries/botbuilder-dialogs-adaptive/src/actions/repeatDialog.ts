/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogConfiguration, Dialog, DialogContext } from 'botbuilder-dialogs';

export interface RepeatDialogConfiguration extends DialogConfiguration {
    /**
     * (Optional) static options to pass into the dialog when it's repeated.
     *
     * @remarks
     * These options will be merged with any options that were originally passed into the dialog
     * or options that were dynamically configured using [inputBindings](#inputbindings).
     */
    options?: object;
}

export class RepeatDialog extends Dialog {

    /**
     * Creates a new `RepeatDialog` instance.
     * @param options (Optional) static options to pass into the dialog when it's repeated.
     */
    constructor(options?: object) {
        super();
        if (options) { this.options = options }
    }

    protected onComputeId(): string {
        return `RepeatDialog[]`;
    }

    /**
     * (Optional) static options to pass into the dialog when it's repeated.
     *
     * @remarks
     * These options will be merged with any options that were originally passed into the dialog
     * or options that were dynamically configured using [inputBindings](#inputbindings).
     */
    public options?: object;

    public configure(config: RepeatDialogConfiguration): this {
        return super.configure(config);
    }

    public async beginDialog(dc: DialogContext, options?: object): Promise<DialogTurnResult> {
        const originalOptions = dc.state.getValue<object>('options').value;
        options = Object.assign({}, originalOptions, options, this.options);
        return await this.repeatParentDialog(dc, options);
    }

    protected async repeatParentDialog(dc: DialogContext, options?: object): Promise<DialogTurnResult> {
        this.popCommands(dc);
        if (dc.stack.length > 0 || !dc.parent) {
            return await dc.replaceDialog(dc.activeDialog.id, options);
        } else {
            const turnsResult = await dc.parent.replaceDialog(dc.parent.activeDialog.id, options);
            turnsResult.parentEnded = true;
            return turnsResult;
        }
    }


    private popCommands(dc: DialogContext): void {
        // Pop all commands off the stack.
        let i = dc.stack.length - 1;
        while (i >= 0) {
            // Commands store the index of the state they're inheriting so we can tell a command
            // by looking to see if its state is of type 'number'.
            if (typeof dc.stack[i].state === 'number') {
                dc.stack.pop();
                i--;
            } else {
                break;
            }
        }
    }
}