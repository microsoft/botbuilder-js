/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogConfiguration, Dialog, DialogCommand, DialogContext } from 'botbuilder-dialogs';

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
        const originalOptions = dc.state.getValue<object>('options');
        options = Object.assign({}, originalOptions, options, this.options);
        return await this.repeatParentDialog(dc, options);
    }
}