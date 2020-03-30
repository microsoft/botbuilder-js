/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogContext, Dialog } from 'botbuilder-dialogs';
import { ValueExpression, StringExpression, BoolExpression } from '../expressions';

export class SetProperty<O extends object = {}> extends Dialog<O> {
    public constructor();
    public constructor(property: string, value: any);
    public constructor(property?: string, value?: any) {
        super();
        if (property) { this.property = new StringExpression(property); }
        if (value) { this.value = new ValueExpression(value); }
    }

    /**
     * Property path to put the value in.
     */
    public property: StringExpression;

    /**
     * The expression to get the value to put into property path.
     */
    public value: ValueExpression;

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        if (!this.property) { throw new Error(`${ this.id }: no 'property' specified.`); }
        if (!this.value) { throw new Error(`${ this.id }: no 'value' expression specified.`); }

        // Evaluate expression and save value
        const property = this.property.getValue(dc.state);
        const value = this.value.getValue(dc.state);
        dc.state.setValue(property, value);

        return await dc.endDialog();
    }

    protected onComputeId(): string {
        return `SetProperty[${ this.value.toString() }]`;
    }

}
