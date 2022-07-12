/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BoolProperty, StringProperty, UnknownProperty } from '../properties';
import { evaluateExpression } from '../jsonExtensions';

import {
    BoolExpression,
    BoolExpressionConverter,
    StringExpression,
    StringExpressionConverter,
    ValueExpression,
    ValueExpressionConverter,
} from 'adaptive-expressions';

import {
    Converter,
    ConverterFactory,
    Dialog,
    DialogConfiguration,
    DialogContext,
    DialogTurnResult,
} from 'botbuilder-dialogs';

export interface SetPropertyConfiguration extends DialogConfiguration {
    property?: StringProperty;
    value?: UnknownProperty;
    disabled?: BoolProperty;
}

/**
 * Sets a property with the result of evaluating a value expression.
 */
export class SetProperty<O extends object = {}> extends Dialog<O> implements SetPropertyConfiguration {
    static $kind = 'Microsoft.SetProperty';

    constructor();

    /**
     * Initializes a new instance of the [SetProperty](xref:botbuilder-dialogs-adaptive.SetProperty) class.
     *
     * @param property Property path to put the value in.
     * @param value The expression to get the value to put into property path.
     */
    constructor(property: string, value: any);

    /**
     * Initializes a new instance of the [SetProperty](xref:botbuilder-dialogs-adaptive.SetProperty) class.
     *
     * @param property Optional. Property path to put the value in.
     * @param value Optional. The expression to get the value to put into property path.
     */
    constructor(property?: string, value?: any) {
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
    property: StringExpression;

    /**
     * The expression to get the value to put into property path.
     */
    value: ValueExpression;

    /**
     * An optional expression which if is true will disable this action.
     */
    disabled?: BoolExpression;

    /**
     * @param property The key of the conditional selector configuration.
     * @returns The converter for the selector configuration.
     */
    getConverter(property: keyof SetPropertyConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'property':
                return new StringExpressionConverter();
            case 'value':
                return new ValueExpressionConverter();
            case 'disabled':
                return new BoolExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

    /**
     * Starts a new [Dialog](xref:botbuilder-dialogs.Dialog) and pushes it onto the dialog stack.
     *
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param _options Optional. Initial information to pass to the dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    async beginDialog(dc: DialogContext, _options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        if (!this.property) {
            throw new Error(`${this.id}: no 'property' specified.`);
        }
        if (!this.value) {
            throw new Error(`${this.id}: no 'value' expression specified.`);
        }

        const property = this.property.getValue(dc.state);
        const value = evaluateExpression(dc.state, this.value);

        dc.state.setValue(property, value);

        return await dc.endDialog();
    }

    /**
     * @protected
     * Builds the compute Id for the [Dialog](xref:botbuilder-dialogs.Dialog).
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        return `SetProperty[${this.property.toString()}]`;
    }
}
