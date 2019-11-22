/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogConfiguration, DialogContext, Dialog } from 'botbuilder-dialogs';
import { ExpressionPropertyValue, ExpressionProperty } from '../expressionProperty';

export interface SetPropertyConfiguration extends DialogConfiguration {
    /**
     * The in-memory property to set.
     */
    property?: string;

    /**
     * The expression value to assign to the property.
     */
    value?: ExpressionPropertyValue<any>;
}

export class SetProperty<O extends object = {}> extends Dialog<O> {
    /**
     * The in-memory property to set.
     */
    public property: string;

    /**
     * The value to assign to the property.
     */
    public value: ExpressionProperty<any>;

    /**
     * Creates a new `SetProperty` instance.
     * @param property The in-memory property to set.
     * @param value The expression value to assign to the property.
     */
    constructor();
    constructor(property: string, value: ExpressionPropertyValue<any>);
    constructor(property?: string, value?: ExpressionPropertyValue<any>) {
        super();
        if (property) { this.property = property }
        if (value) { this.value = new ExpressionProperty(value) }
    }

    protected onComputeId(): string {
        const label = this.value ? this.value.toString() : '';
        return `SetProperty[${label}]`;
    }

    public configure(config: SetPropertyConfiguration): this {
        for (const key in config) {
            if (config.hasOwnProperty(key)) {
                const value = config[key];
                switch(key) {
                    case 'value':
                        this.value = new ExpressionProperty(value);
                        break;
                    default:
                        super.configure({ [key]: value });
                        break;
                }

            }
        }

        return this;
    }

    public async beginDialog(dc: DialogContext): Promise<DialogTurnResult> {
        // Ensure planning context and condition
        if (!this.property) { throw new Error(`${this.id}: no 'property' specified.`) }
        if (!this.value) { throw new Error(`${this.id}: no 'value' expression specified.`) }

        // Evaluate expression and save value
        const memory = dc.state;
        const value = this.value.evaluate(this.id, memory);
        dc.state.setValue(this.property, value);

        return await dc.endDialog();
    }
}
