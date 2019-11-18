/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogConfiguration, DialogContext, DialogCommand, Dialog } from 'botbuilder-dialogs';
import { SequenceContext } from '../sequenceContext';

export interface InitPropertyConfiguration extends DialogConfiguration {
    /**
     * The in-memory property to set.
     */
    property?: string;

    /**
     * Gets or sets type, either Array or Object.
     */
    type?: string;
}

export class InitProperty extends Dialog {
    /**
     * The in-memory property to set.
     */
    public property: string;

    /**
     * Gets or sets type, either Array or Object. Type, either Array or Object.
     */
    public type?: string;

    /**
     * Creates a new `Init` instance.
     * @param property The in-memory property to set.
     * @param type Type, either Array or Object.
     */
    constructor();
    constructor(property: string, type: string);
    constructor(property?: string, type?: string) {
        super();
        if (property) { this.property = property }
        if (type) { this.type = type }
    }

    protected onComputeId(): string {
        const label = this.property ? this.property : '';
        return `InitProperty[${label}]`;
    }

    public configure(config: InitPropertyConfiguration): this {
        return super.configure(config);
    }

    public async beginDialog(dc: DialogContext): Promise<DialogTurnResult> {
        // Ensure planning context and condition
        if (!(dc instanceof SequenceContext)) { throw new Error(`${this.id}: should only be used within an AdaptiveDialog.`) }

        if (!this.property) { throw new Error(`${this.id}: no 'property' specified.`) }
        if (!this.type) { throw new Error(`${this.id}: no 'type' specified.`) }

        switch (this.type.toLowerCase()) {
            case "array":
                dc.state.setValue(this.property, [])
                break;
            case "object":
                dc.state.setValue(this.property, {})
                break;
        }

        return await dc.endDialog();
    }
}
