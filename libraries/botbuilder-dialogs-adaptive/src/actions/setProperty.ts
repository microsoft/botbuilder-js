/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import {
    ValueExpression,
    StringExpression,
    BoolExpression,
    BoolExpressionConverter,
    StringExpressionConverter,
    ValueExpressionConverter,
} from 'adaptive-expressions';
import { Converters, DialogTurnResult, DialogContext, Dialog, Properties } from 'botbuilder-dialogs';
import { replaceJsonRecursively } from '../jsonExtensions';

export class SetProperty<O extends object = {}> extends Dialog<O> {
    public static $kind = 'Microsoft.SetProperty';

    public constructor();
    public constructor(property: string, value: any);
    public constructor(property?: string, value?: any) {
        super();
        if (property) {
            this.property = new StringExpression(property);
        }
        if (value) {
            this.value = new ValueExpression(value);
        }
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

    public get converters(): Converters<Properties<SetProperty>> {
        return {
            property: new StringExpressionConverter(),
            value: new ValueExpressionConverter(),
            disabled: new BoolExpressionConverter(),
        };
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        if (!this.property) {
            throw new Error(`${this.id}: no 'property' specified.`);
        }
        if (!this.value) {
            throw new Error(`${this.id}: no 'value' expression specified.`);
        }

        // Evaluate expression and save value
        const property = this.property.getValue(dc.state);
        let value = this.value.getValue(dc.state);

        if (value) {
            value = replaceJsonRecursively(dc.state, value);
        }

        dc.state.setValue(property, value);

        return await dc.endDialog();
    }

    protected onComputeId(): string {
        return `SetProperty[${this.value.toString()}]`;
    }
}
