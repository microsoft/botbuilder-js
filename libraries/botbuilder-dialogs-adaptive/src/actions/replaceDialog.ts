/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogConfiguration, DialogContext, Dialog } from 'botbuilder-dialogs';

export interface ReplaceDialogConfiguration extends DialogConfiguration {
    /**
     * ID of the dialog to replace the current one with.
     */
    dialogId: string;

    /**
     * (Optional) static options to pass to the goto dialog.
     *
     * @remarks
     * These options will be merged with any dynamic options configured as
     * [inputProperties](#inputproperties).
     */
    options?: object;
}

export class ReplaceDialog extends Dialog {

    /**
     * Creates a new `ReplaceWithDialog` instance.
     * @param dialogId ID of the dialog to goto.
     * @param options (Optional) static options to pass the dialog.
     */
    constructor();
    constructor(dialogId: string, options?: object);
    constructor(dialogId?: string, options?: object) {
        super();
        if (dialogId) { this.dialogId = dialogId }
        if (options) { this.options = options }
    }

    protected onComputeId(): string {
        return `ReplaceDialog[${this.dialogId}]`;
    }

    /**
     * ID of the dialog to goto.
     */
    public dialogId: string;

    /**
     * (Optional) static options to pass to the goto dialog.
     *
     * @remarks
     * These options will be merged with any dynamic options configured as
     * [inputProperties](#inputproperties).
     */
    public options?: object;

    public configure(config: ReplaceDialogConfiguration): this {
        return super.configure(config);
    }

    public async beginDialog (dc: DialogContext, options?: object): Promise<DialogTurnResult> {
        options = Object.assign({}, options, this.options);
        return await this.replaceParentDialog(dc, this.dialogId, options);
    }

    protected async replaceParentDialog(dc: DialogContext, dialogId: string, options?: object): Promise<DialogTurnResult> {
        this.popCommands(dc);
        if (dc.stack.length > 0 || !dc.parent) {
            return await dc.replaceDialog(dialogId, options);
        } else {
            const turnResult = await dc.parent.replaceDialog(dialogId, options);
            turnResult.parentEnded = true;
            return turnResult;
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