/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogConfiguration, DialogCommand, DialogContext } from 'botbuilder-dialogs';

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

    public configure(config: EndDialogConfiguration): this {
        return super.configure(config);
    }

    protected onComputeID(): string {
        return `EndDialog[${this.resultProperty || ''}]`;
    }

    /**
     * (Optional) specifies an in-memory state property that should be returned to the calling
     * dialog.
     */
    public resultProperty: string;

    protected async onRunCommand(dc: DialogContext): Promise<DialogTurnResult> {
        const result = this.resultProperty ? dc.state.getValue(this.resultProperty) : undefined;
        return await this.endParentDialog(dc, result);
    }
}