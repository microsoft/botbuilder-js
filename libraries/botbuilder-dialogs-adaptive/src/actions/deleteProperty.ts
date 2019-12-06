/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogConfiguration, DialogContext, Dialog } from 'botbuilder-dialogs';

export interface DeletePropertyConfiguration extends DialogConfiguration {
    /**
     * The property to delete.
     */
    property?: string;
}

export class DeleteProperty<O extends object = {}> extends Dialog<O> {
    /**
     * The property to delete.
     */
    public property: string;

    /**
     * Creates a new `DeleteProperty` instance.
     * @param property (Optional) property to delete.
     */
    constructor(property?: string) {
        super();
        if (property) { this.property = property; }
    }

    protected onComputeId(): string {
        return `DeleteProperty[${this.property}]`;
    }

    public configure(config: DeletePropertyConfiguration): this {
        return super.configure(config);
    }

    public async beginDialog(dc: DialogContext): Promise<DialogTurnResult> {
        dc.state.deleteValue(this.property);
        return await dc.endDialog();
    }
}
