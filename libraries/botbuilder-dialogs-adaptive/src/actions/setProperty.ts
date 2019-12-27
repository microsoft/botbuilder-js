/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogConfiguration, DialogContext, Dialog } from 'botbuilder-dialogs';
import { Expression, ExpressionEngine } from 'botframework-expressions';

export interface SetPropertyConfiguration extends DialogConfiguration {
    property?: string;
    value?: string;
}

export class SetProperty<O extends object = {}> extends Dialog<O> {

    public static declarativeType = 'Microsoft.SetProperty';

    public constructor();
    public constructor(property: string, value: string);
    public constructor(property?: string, value?: string) {
        super();
        if (property) { this.property = property; }
        if (value) { this.value = value; }
    }

    private _value: Expression;

    /**
     * Property path to put the value in.
     */
    public property: string;

    /**
     * Get the expression to get the value to put into property path.
     */
    public get value(): string {
        return this._value ? this._value.toString() : undefined;
    }

    /**
     * Set the expression to get the value to put into property path.
     */
    public set value(value: string) {
        this._value = value ? new ExpressionEngine().parse(value) : undefined;
    }

    public configure(config: SetPropertyConfiguration): this {
        return super.configure(config);
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        // Ensure planning context and condition
        if (!this.property) { throw new Error(`${ this.id }: no 'property' specified.`); }
        if (!this.value) { throw new Error(`${ this.id }: no 'value' expression specified.`); }

        // Evaluate expression and save value
        const { value, error } = this._value.tryEvaluate(dc.state);
        if (error) {
            throw new Error(`Expression evaluation resulted in an error. Expression: ${ this.value }. Error: ${ error }`);
        }
        dc.state.setValue(this.property, value);

        return await dc.endDialog();
    }

    protected onComputeId(): string {
        const label = this.value ? this.value.toString() : '';
        return `SetProperty[${ label }]`;
    }

}
