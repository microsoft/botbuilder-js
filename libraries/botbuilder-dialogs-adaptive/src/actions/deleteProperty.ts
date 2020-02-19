/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogConfiguration, DialogContext, Dialog, Configurable } from 'botbuilder-dialogs';
import { BoolExpression, StringExpression } from '../expressionProperties';

export interface DeletePropertyConfiguration extends DialogConfiguration {
    /**
     * The property to delete.
     */
    property?: string;

    disabled?: string | boolean;
}

export class DeleteProperty<O extends object = {}> extends Dialog<O> implements Configurable {
    public static declarativeType = 'Microsoft.DeleteProperty';

    /**
     * Creates a new `DeleteProperty` instance.
     * @param property (Optional) property to delete.
     */
    public constructor();
    public constructor(property?: string) {
        super();
        if (property) { this.property = new StringExpression(property); }
    }

    /**
     * The property to delete.
     */
    public property: StringExpression;

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    public configure(config: DeletePropertyConfiguration): this {
        for (const key in config) {
            if (config.hasOwnProperty(key)) {
                const value = config[key];
                switch (key) {
                    case 'property':
                        this.property = new StringExpression(value);
                        break;
                    case 'disabled':
                        this.disabled = new BoolExpression(value);
                        break;
                    default:
                        super.configure({ [key]: value });
                        break;
                }
            }
        }

        return this;
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        dc.state.deleteValue(this.property.getValue(dc.state));
        return await dc.endDialog();
    }

    protected onComputeId(): string {
        return `DeleteProperty[${ this.property.toString() }]`;
    }
}
