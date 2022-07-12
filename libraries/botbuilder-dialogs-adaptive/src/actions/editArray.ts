/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BoolProperty, EnumProperty, StringProperty, UnknownProperty } from '../properties';

import {
    BoolExpression,
    BoolExpressionConverter,
    EnumExpression,
    EnumExpressionConverter,
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

export enum ArrayChangeType {
    push = 'push',
    pop = 'pop',
    take = 'take',
    remove = 'remove',
    clear = 'clear',
}

export interface EditArrayConfiguration extends DialogConfiguration {
    changeType?: EnumProperty<ArrayChangeType>;
    itemsProperty?: StringProperty;
    resultProperty?: StringProperty;
    value?: UnknownProperty;
    disabled?: BoolProperty;
}

/**
 * Lets you modify an array in memory.
 */
export class EditArray<O extends object = {}> extends Dialog<O> implements EditArrayConfiguration {
    static $kind = 'Microsoft.EditArray';

    constructor();

    /**
     * Initializes a new instance of the [EditArray](xref:botbuilder-dialogs-adaptive.EditArray) class.
     *
     * @param changeType [ArrayChangeType](xref:botbuilder-dialogs-adaptive.ArrayChangeType), change type.
     * @param itemsProperty Array property.
     * @param value Optional. Value to insert.
     * @param resultProperty Optional. Output property to put Pop/Take into.
     */
    constructor(changeType: ArrayChangeType, itemsProperty: string, value?: any, resultProperty?: string);

    /**
     * Initializes a new instance of the [EditArray](xref:botbuilder-dialogs-adaptive.EditArray) class.
     *
     * @param changeType Optional. [ArrayChangeType](xref:botbuilder-dialogs-adaptive.ArrayChangeType), change type.
     * @param itemsProperty Optional. Array property.
     * @param value Optional. Value to insert.
     * @param resultProperty Optional. Output property to put Pop/Take into.
     */
    constructor(changeType?: ArrayChangeType, itemsProperty?: string, value?: any, resultProperty?: string) {
        super();
        if (changeType) {
            this.changeType = new EnumExpression<ArrayChangeType>(changeType);
        }
        if (itemsProperty) {
            this.itemsProperty = new StringExpression(itemsProperty);
        }
        switch (changeType) {
            case ArrayChangeType.clear:
            case ArrayChangeType.pop:
            case ArrayChangeType.take:
                this.resultProperty = new StringExpression(resultProperty);
                break;
            case ArrayChangeType.push:
            case ArrayChangeType.remove:
                this.value = new ValueExpression(value);
                break;
            default:
                break;
        }
    }

    /**
     * Type of change being applied.
     */
    changeType: EnumExpression<ArrayChangeType> = new EnumExpression<ArrayChangeType>(ArrayChangeType.push);

    /**
     * Property path expression to the collection of items.
     */
    itemsProperty: StringExpression;

    /**
     * The path expression to store the result of action.
     */
    resultProperty: StringExpression;

    /**
     * The expression of the value to put onto the array.
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
    getConverter(property: keyof EditArrayConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'changeType':
                return new EnumExpressionConverter<ArrayChangeType>(ArrayChangeType);
            case 'itemsProperty':
                return new StringExpressionConverter();
            case 'resultProperty':
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

        if (!this.itemsProperty) {
            throw new Error(
                `EditArray: "${this.changeType.toString()}" operation couldn't be performed because the itemsProperty wasn't specified.`
            );
        }

        // Get list and ensure populated
        let list: any[] = dc.state.getValue(this.itemsProperty.getValue(dc.state), []);

        // Manipulate list
        let result: any;
        let evaluationResult: any;
        switch (this.changeType.getValue(dc.state)) {
            case ArrayChangeType.pop:
                result = list.pop();
                break;
            case ArrayChangeType.push:
                this.ensureValue();
                evaluationResult = this.value.getValue(dc.state);
                if (evaluationResult != undefined) {
                    list.push(evaluationResult);
                }
                break;
            case ArrayChangeType.take:
                result = list.shift();
                break;
            case ArrayChangeType.remove:
                this.ensureValue();
                evaluationResult = this.value.getValue(dc.state);
                if (evaluationResult != undefined) {
                    result = false;
                    for (let i = 0; i < list.length; i++) {
                        if (
                            JSON.stringify(evaluationResult) == JSON.stringify(list[i]) ||
                            evaluationResult === list[i]
                        ) {
                            list.splice(i, 1);
                            result = true;
                            break;
                        }
                    }
                }
                break;
            case ArrayChangeType.clear:
                result = list.length > 0;
                list = [];
                break;
        }

        // Save list and last result
        dc.state.setValue(this.itemsProperty.getValue(dc.state), list);
        if (this.resultProperty) {
            dc.state.setValue(this.resultProperty.getValue(dc.state), result);
        }
        return await dc.endDialog();
    }

    /**
     * @protected
     * Builds the compute Id for the [Dialog](xref:botbuilder-dialogs.Dialog).
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        return `EditArray[${this.changeType.toString()}: ${this.itemsProperty.toString()}]`;
    }

    /**
     * @private
     */
    private ensureValue(): void {
        if (!this.value) {
            throw new Error(
                `EditArray: "${this.changeType.toString()}" operation couldn't be performed for list "${
                    this.itemsProperty
                }" because a value wasn't specified.`
            );
        }
    }
}
