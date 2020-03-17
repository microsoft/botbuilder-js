/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogContext, Dialog } from 'botbuilder-dialogs';
import { ValueExpression, StringExpression, BoolExpression, EnumExpression } from '../expressionProperties';

export enum ArrayChangeType {
    push = 'push',
    pop = 'pop',
    take = 'take',
    remove = 'remove',
    clear = 'clear'
}

export class EditArray<O extends object = {}> extends Dialog<O> {
    public constructor();
    public constructor(changeType: ArrayChangeType, itemsProperty: string, value?: any, resultProperty?: string);
    public constructor(changeType?: ArrayChangeType, itemsProperty?: string, value?: any, resultProperty?: string) {
        super();
        if (changeType) { this.changeType = new EnumExpression(changeType); }
        if (itemsProperty) { this.itemsProperty = new StringExpression(itemsProperty); }
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
    public changeType: EnumExpression = new EnumExpression(ArrayChangeType.push);

    /**
     * Property path expression to the collection of items.
     */
    public itemsProperty: StringExpression;

    /**
     * The path expression to store the result of action.
     */
    public resultProperty: StringExpression;

    /**
     * The expression of the value to put onto the array.
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

        if (!this.itemsProperty) {
            throw new Error(`EditArray: "${ this.changeType.toString() }" operation couldn't be performed because the itemsProperty wasn't specified.`);
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
                        if ((JSON.stringify(evaluationResult) == JSON.stringify(list[i])) || evaluationResult === list[i]) {
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

    protected onComputeId(): string {
        return `EditArray[${ this.changeType.toString() }: ${ this.itemsProperty.toString() }]`;
    }

    private ensureValue(): void {
        if (!this.value) { throw new Error(`EditArray: "${ this.changeType.toString() }" operation couldn't be performed for list "${ this.itemsProperty }" because a value wasn't specified.`) }
    }
}