/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogContext, DialogConfiguration, Dialog } from 'botbuilder-dialogs';

export interface EditArrayConfiguration extends DialogConfiguration {
    changeType?: ArrayChangeType;

    arrayProperty?: string;

    itemProperty?: string;
}

export enum ArrayChangeType {
    push = 'push',
    pop = 'pop',
    take = 'take',
    remove = 'remove',
    clear = 'clear'
}

export class EditArray<O extends object = {}> extends Dialog<O> {

    constructor();
    constructor(changeType: ArrayChangeType, arrayProperty: string, itemProperty?: string);
    constructor(changeType?: ArrayChangeType, arrayProperty?: string, itemProperty?: string) {
        super();
        if (changeType) { this.changeType = changeType }
        if (arrayProperty) { this.arrayProperty = arrayProperty }
        if (itemProperty) { this.itemProperty = itemProperty }
    }

    protected onComputeId(): string {
        return `EditArray[${this.changeType}: ${this.arrayProperty}]`;
    }

    public changeType: ArrayChangeType;

    public arrayProperty: string;

    public itemProperty: string;

    public configure(config: EditArrayConfiguration): this {
        return super.configure(config);
    }

    public async beginDialog(dc: DialogContext, options: O): Promise<DialogTurnResult> {
        if (!this.arrayProperty) { throw new Error(`EditArray: "${this.changeType}" operation couldn't be performed because the listProperty wasn't specified.`) }

        // Get list and ensure populated
        let list: any[]  = dc.state.getValue(this.arrayProperty).value;
        if (!Array.isArray(list)) { list = [] }

        // Manipulate list
        let item: any;
        let serialized: string;
        let lastResult: any;
        switch (this.changeType) {
            case ArrayChangeType.pop:
                item = list.pop();
                if (this.itemProperty) {
                    dc.state.setValue(this.itemProperty, item);
                }
                lastResult = item;
                break;
            case ArrayChangeType.push:
                this.ensureItemProperty();
                item = dc.state.getValue(this.itemProperty).value;
                lastResult = item != undefined;
                if (lastResult) {
                    list.push(item);
                }
                break;
            case ArrayChangeType.take:
                item = list.shift();
                if (this.itemProperty) {
                    dc.state.setValue(this.itemProperty, item);
                }
                lastResult = item;
                break;
            case ArrayChangeType.remove:
                this.ensureItemProperty();
                item = dc.state.getValue(this.itemProperty).value;
                if (item != undefined) {
                    serialized = Array.isArray(item) || typeof item == 'object' ? JSON.stringify(item) : undefined;
                    lastResult = false;
                    for (let i = 0; i < list.length; i++) {
                        if ((serialized && JSON.stringify(list[i]) == serialized) || item === list[i]) {
                            list.splice(i, 1);
                            lastResult = true;
                            break;
                        }
                    }
                }
                break;
            case ArrayChangeType.clear:
                lastResult = list.length > 0;
                list = [];
                break;
        }

        // Save list and last result
        dc.state.setValue(this.arrayProperty, list);
        dc.state.setValue('dialog.lastResult', lastResult);
        return await dc.endDialog();
    }

    private ensureItemProperty(): void {
        if (!this.itemProperty) { throw new Error(`EditArray: "${this.changeType}" operation couldn't be performed for list "${this.arrayProperty}" because an itemProperty wasn't specified.`) }
    }
}