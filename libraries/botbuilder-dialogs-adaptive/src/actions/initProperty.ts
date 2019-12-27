/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogConfiguration, DialogContext, Dialog } from 'botbuilder-dialogs';
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

export class InitProperty<O extends object = {}> extends Dialog<O> {

    public static declarativeType = 'Microsoft.InitProperty';

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
    public constructor();
    public constructor(property: string, type: string);
    public constructor(property?: string, type?: string) {
        super();
        if (property) { this.property = property; }
        if (type) { this.type = type; }
    }

    public configure(config: InitPropertyConfiguration): this {
        return super.configure(config);
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        // Ensure planning context and condition
        if (!(dc instanceof SequenceContext)) { throw new Error(`${ this.id }: should only be used within an AdaptiveDialog.`); }

        if (!this.property) { throw new Error(`${ this.id }: no 'property' specified.`); }
        if (!this.type) { throw new Error(`${ this.id }: no 'type' specified.`); }

        switch (this.type.toLowerCase()) {
            case 'array':
                dc.state.setValue(this.property, []);
                break;
            case 'object':
                dc.state.setValue(this.property, {});
                break;
        }

        return await dc.endDialog();
    }

    protected onComputeId(): string {
        return `InitProperty[${ this.property }]`;
    }
}
