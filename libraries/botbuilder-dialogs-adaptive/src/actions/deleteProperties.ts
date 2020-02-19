/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog, DialogContext, DialogTurnResult, DialogConfiguration, Configurable } from 'botbuilder-dialogs';
import { StringExpression, BoolExpression } from '../expressionProperties';

export interface DeletePropertiesConfiguration extends DialogConfiguration {
    properties?: string[];
    disabled?: string | boolean;
}

export class DeleteProperties<O extends object = {}> extends Dialog<O> implements Configurable {
    public static declarativeType = 'Microsoft.DeleteProperties';

    public constructor();
    public constructor(properties?: string[]) {
        super();
        if (properties) {
            this.properties = properties.map((property): StringExpression => new StringExpression(property));
        }
    }

    /**
     * Collection of property paths to remove.
     */
    public properties: StringExpression[] = [];

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    public configure(config: DeletePropertiesConfiguration): this {
        for (const key in config) {
            if (config.hasOwnProperty(key)) {
                const value = config[key];
                switch (key) {
                    case 'properties':
                        if (Array.isArray(value)) {
                            this.properties = value.map((item): StringExpression => new StringExpression(item));
                            break;
                        }
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

        if (this.properties && this.properties.length > 0) {
            for (let i = 0; i < this.properties.length; i++) {
                dc.state.deleteValue(this.properties[i].getValue(dc.state));
            }
        }

        return await dc.endDialog();
    }

    protected onComputeId(): string {
        return `DeleteProperties[${ this.properties.map((property): string => property.toString()).join(',') }]`;
    }
}