/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogConfiguration, Dialog, DialogCommand, DialogContext } from 'botbuilder-dialogs';

export interface EndDialogConfiguration extends DialogConfiguration {
    /**
     * (Optional) specifies an in-memory state property that should be returned to the calling
     * dialog.
     */
    resultProperty?: string;
}

export class EndDialog extends DialogCommand {

    /**
     * Creates a new `EndDialog` instance.
     * @param resultProperty (Optional) in-memory state property to return to the called dialog.
     */
    constructor(resultProperty?: string) {
        super();
        if (resultProperty) { this.resultProperty = resultProperty }
    }

    protected onComputeID(): string {
        return `end(${this.resultProperty || ''})`;
    }

    /**
     * (Optional) specifies an in-memory state property that should be returned to the calling
     * dialog.
     */
    public resultProperty: string;

    public configure(config: EndDialogConfiguration): this {
        super.configure(config);
        if (config.resultProperty) { this.resultProperty = config.resultProperty }
        return this;
    }

    protected async onRunCommand(dc: DialogContext): Promise<DialogTurnResult> {
        const result = this.resultProperty ? dc.state.getValue(this.resultProperty) : undefined;
        return await this.endParentDialog(dc, result);
    }
}