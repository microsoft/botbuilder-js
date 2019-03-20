/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogConfiguration, Dialog, DialogCommand, DialogContext } from 'botbuilder-dialogs';

export interface GotoDialogConfiguration extends DialogConfiguration {
    /**
     * ID of the dialog to goto.
     */
    dialogId: string;

    /**
     * (Optional) static options to pass to the goto dialog.
     * 
     * @remarks
     * These options will be merged with any dynamic options configured as 
     * [inputBindings](#inputbindings).
     */
    options?: object;
}

export class GotoDialog extends DialogCommand {

    /**
     * Creates a new `GotoDialog` instance.
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

    protected onComputeID(): string {
        return `goto[${this.hashedLabel(this.dialogId)}]`;
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
     * [inputBindings](#inputbindings).
     */
    public options?: object;

    public configure(config: GotoDialogConfiguration): this {
        return super.configure(config);
    }

    protected async onRunCommand(dc: DialogContext, options?: object): Promise<DialogTurnResult> {
        options = Object.assign({}, options, this.options);
        return await this.replaceParentDialog(dc, this.dialogId, options);
    }
}