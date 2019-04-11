/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogConfiguration, DialogContext, DialogCommand, DialogContextState, DialogContextVisibleState } from 'botbuilder-dialogs';
import { ExpressionEngine } from 'botbuilder-expression-parser';
import { Expression } from 'botbuilder-expression';

export interface SetPropertyConfiguration extends DialogConfiguration {
    /**
     * The in-memory property to set.
     */
    property?: string;

    /**
     * The expression value to assign to the property.
     */
    value?: string;
}

export type ExpressionDelegate<T> = (state: DialogContextVisibleState) => T;

export class SetProperty<O extends object = {}> extends DialogCommand<O> {
    /**
     * The in-memory property to set.
     */
    public property: string;

    /**
     * The expression value to assign to the property.
     */
    public value: Expression;

    /**
     * Creates a new `SetProperty` instance.
     * @param property The in-memory property to set.
     * @param value The expression value to assign to the property.
     */
    constructor();
    constructor(property: string, value: string|Expression|ExpressionDelegate<any>);
    constructor(property?: string, value?: string|Expression|ExpressionDelegate<any>) {
        super();
        if (property) { this.property = property }
        if (value) { 
            switch (typeof value) {
                case 'string':
                    this.value = engine.Parse(value);
                    break; 
                case 'function':
                    this.value = Expression.Lambda(value);
                    break;
                default:
                    this.value = value as Expression;
                    break;
            }
        }
    }

    protected onComputeID(): string {
        const label = this.value ? this.value.toString() : '';
        return `setProperty[${this.hashedLabel(label)}]`;
    }

    public configure(config: SetPropertyConfiguration): this {
        const cfg: SetPropertyConfiguration = {};
        for (const key in config) {
            switch(key) {
                case 'value':
                    this.value = engine.Parse(config.value);
                    break;
                default:
                    cfg[key] = config[key];
                    break;
            }
        }
        return super.configure(cfg);
    }

    public async onRunCommand(dc: DialogContext): Promise<DialogTurnResult> {
        // Ensure planning context and condition
        if (!this.property) { throw new Error(`${this.id}: no 'property' specified.`) }
        if (!this.value) { throw new Error(`${this.id}: no 'value' expression specified.`) }

        // Evaluate expression
        const memory = dc.state.toJSON();
        const { error, value } = this.value.TryEvaluate(memory);

        // Check for error
        if (error) { 
            throw new Error(`${this.id}: expression error - ${error.toString()}`);
        } else {
            dc.state.setValue(this.property, value);
        }

        return await dc.endDialog();
    }
}

const engine = new ExpressionEngine();