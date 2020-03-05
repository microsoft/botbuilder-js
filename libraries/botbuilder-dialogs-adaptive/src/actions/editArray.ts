/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogContext, DialogConfiguration, Dialog, Configurable } from 'botbuilder-dialogs';
import { Expression, ExpressionEngine } from 'adaptive-expressions';

export interface EditArrayConfiguration extends DialogConfiguration {
    changeType?: ArrayChangeType;
    itemsProperty?: string;
    resultProperty?: string;
    value?: string;
    disabled?: string;
}

export enum ArrayChangeType {
    push = 'push',
    pop = 'pop',
    take = 'take',
    remove = 'remove',
    clear = 'clear'
}

export class EditArray<O extends object = {}> extends Dialog<O> implements Configurable {
    public static declarativeType = 'Microsoft.EditArray';

    public constructor();
    public constructor(changeType: ArrayChangeType, itemsProperty: string, value?: string, resultProperty?: string);
    public constructor(changeType?: ArrayChangeType, itemsProperty?: string, value?: string, resultProperty?: string) {
        super();
        if (changeType) { this.changeType = changeType; }
        if (itemsProperty) { this.itemsProperty = itemsProperty; }
        switch (changeType) {
            case ArrayChangeType.clear:
            case ArrayChangeType.pop:
            case ArrayChangeType.take:
                this.resultProperty = resultProperty;
                break;
            case ArrayChangeType.push:
            case ArrayChangeType.remove:
                this.value = value;
                break;
            default:
                break;
        }
    }

    /**
     * Type of change being applied.
     */
    public changeType: ArrayChangeType = ArrayChangeType.push;

    /**
     * Get property path expression to the collection of items.
     */
    public get itemsProperty(): string {
        return this._itemsProperty ? this._itemsProperty.toString() : undefined;
    }

    /**
     * Set property path expression to the collection of items.
     */
    public set itemsProperty(value: string) {
        this._itemsProperty = value ? new ExpressionEngine().parse(value) : undefined;
    }

    /**
     * Get the path expression to store the result of action.
     */
    public get resultProperty(): string {
        return this._resultProperty ? this._resultProperty.toString() : undefined;
    }

    /**
     * Set the path expression to store the result of action.
     */
    public set resultProperty(value: string) {
        this._resultProperty = value ? new ExpressionEngine().parse(value) : undefined;
    }

    /**
     * Get the expression of the value to put onto the array.
     */
    public get value(): string {
        return this._value ? this._value.toString() : undefined;
    }

    /**
     * Set the expression of the value to put onto the array.
     */
    public set value(value: string) {
        this._value = value ? new ExpressionEngine().parse(value) : undefined;
    }

    /**
     * Get an optional expression which if is true will disable this action.
     */
    public get disabled(): string {
        return this._disabled ? this._disabled.toString() : undefined;
    }

    /**
     * Set an optional expression which if is true will disable this action.
     */
    public set disabled(value: string) {
        this._disabled = value ? new ExpressionEngine().parse(value) : undefined;
    }

    private _value: Expression;

    private _itemsProperty: Expression;

    private _resultProperty: Expression;

    private _disabled: Expression;

    public configure(config: EditArrayConfiguration): this {
        return super.configure(config);
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this._disabled) {
            const { value } = this._disabled.tryEvaluate(dc.state);
            if (!!value) {
                return await dc.endDialog();
            }
        }

        if (!this.itemsProperty) {
            throw new Error(`EditArray: "${ this.changeType }" operation couldn't be performed because the itemsProperty wasn't specified.`);
        }

        // Get list and ensure populated
        let list: any[] = dc.state.getValue(this.itemsProperty);
        // if (!Array.isArray(list)) { list = [] }

        // Manipulate list
        let result: any;
        let evaluationResult: any;
        switch (this.changeType) {
            case ArrayChangeType.pop:
                result = list.pop();
                break;
            case ArrayChangeType.push:
                this.ensureValue();
                evaluationResult = this._value.tryEvaluate(dc.state);
                if (evaluationResult.value && !evaluationResult.error) {
                    list.push(evaluationResult.value);
                }
                break;
            case ArrayChangeType.take:
                result = list.shift();
                break;
            case ArrayChangeType.remove:
                this.ensureValue();
                evaluationResult = this._value.tryEvaluate(dc.state);
                if (evaluationResult.value && !evaluationResult.error) {
                    result = false;
                    for (let i = 0; i < list.length; i++) {
                        if ((JSON.stringify(evaluationResult.value) == JSON.stringify(list[i])) || evaluationResult.value === list[i]) {
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
        dc.state.setValue(this.itemsProperty, list);
        if (this.resultProperty) {
            dc.state.setValue(this.resultProperty, result);
        }
        return await dc.endDialog();
    }

    protected onComputeId(): string {
        return `EditArray[${ this.changeType }: ${ this.itemsProperty }]`;
    }

    private ensureValue(): void {
        if (!this.value) { throw new Error(`EditArray: "${ this.changeType }" operation couldn't be performed for list "${ this.itemsProperty }" because a value wasn't specified.`) }
    }
}